// src/main/java/com/signature/XadesSigner.java
package com.signature;

import eu.europa.esig.dss.enumerations.DigestAlgorithm;
import eu.europa.esig.dss.enumerations.SignatureLevel;
import eu.europa.esig.dss.enumerations.SignaturePackaging;
import eu.europa.esig.dss.model.DSSDocument;
import eu.europa.esig.dss.model.FileDocument;
import eu.europa.esig.dss.model.Policy;
import eu.europa.esig.dss.model.SignatureValue;
import eu.europa.esig.dss.model.ToBeSigned;
import eu.europa.esig.dss.token.DSSPrivateKeyEntry;
import eu.europa.esig.dss.token.Pkcs12SignatureToken;
import eu.europa.esig.dss.utils.Utils;
import eu.europa.esig.dss.validation.CommonCertificateVerifier;
import eu.europa.esig.dss.xades.XAdESSignatureParameters;
import eu.europa.esig.dss.xades.signature.XAdESService;

import java.io.File;
import java.io.FileOutputStream;
import java.security.KeyStore.PasswordProtection;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.*;

public class XadesSigner {

    private static final String POLICY_OID = "urn:2.16.788.1.2.1";
    private static final String POLICY_SHA256_BASE64 = "dJfuvjtlkeBfLBKUf142staW57x6LpSKGIfzWvohY3E=";
    private static final String POLICY_SPURI = "http://www.tradenet.com.tn/portal/telechargerTelechargement?lien=Politique_de_Signature_de_la_facture_electronique.pdf";

    public static void main(String[] args) throws Exception {
        if (args.length != 4) {
            System.err.println("Usage: java -jar dss-signer.jar input.xml output.xml keystore.p12 password");
            System.exit(2);
        }
        final String inputPath = args[0];
        final String outputPath = args[1];
        final String keystorePath = args[2];
        final char[] password = args[3].toCharArray();

        try (Pkcs12SignatureToken token = new Pkcs12SignatureToken(new File(keystorePath),
                new PasswordProtection(password))) {

            DSSPrivateKeyEntry key = token.getKeys().get(0);

            FileDocument toSign = new FileDocument(new File(inputPath));

            XAdESSignatureParameters params = new XAdESSignatureParameters();
            params.setSignatureLevel(SignatureLevel.XAdES_BASELINE_B);
            params.setSignaturePackaging(SignaturePackaging.ENVELOPED);
            params.setDigestAlgorithm(DigestAlgorithm.SHA256);
            params.setSigningCertificate(key.getCertificate());
            params.setCertificateChain(key.getCertificateChain());

            Policy policy = new Policy();
            policy.setId(POLICY_OID);
            policy.setDigestAlgorithm(DigestAlgorithm.SHA256);
            policy.setDigestValue(Utils.fromBase64(POLICY_SHA256_BASE64));
            policy.setSpuri(POLICY_SPURI);
            params.bLevel().setSignaturePolicy(policy);

            CommonCertificateVerifier verifier = new CommonCertificateVerifier();
            XAdESService service = new XAdESService(verifier);
            ToBeSigned dataToSign = service.getDataToSign(toSign, params);
            SignatureValue sigVal = token.sign(dataToSign, params.getDigestAlgorithm(), key);
            DSSDocument signed = service.signDocument(toSign, params, sigVal);

            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(signed.openStream());
            doc.getDocumentElement().normalize();

            final String DS = "http://www.w3.org/2000/09/xmldsig#";
            final String XADES = "http://uri.etsi.org/01903/v1.3.2#";

            // a) Signature Id
            Element dsSignature = (Element) doc.getElementsByTagNameNS(DS, "Signature").item(0);
            dsSignature.setAttribute("Id", "SigFrs");

            // b) SignatureValue Id
            Element sigValElem = (Element) dsSignature.getElementsByTagNameNS(DS, "SignatureValue").item(0);
            if (sigValElem != null)
                sigValElem.setAttribute("Id", "value-SigFrs");

            // c) SignedProperties Id
            Element signedProps = (Element) dsSignature.getElementsByTagNameNS(XADES, "SignedProperties").item(0);
            if (signedProps != null)
                signedProps.setAttribute("Id", "xades-SigFrs");

            // d) Reference du contenu
            Element signedInfo = (Element) dsSignature.getElementsByTagNameNS(DS, "SignedInfo").item(0);
            NodeList refs = signedInfo.getElementsByTagNameNS(DS, "Reference");
            Element contentRef = null;
            Element spRef = null;
            for (int i = 0; i < refs.getLength(); i++) {
                Element r = (Element) refs.item(i);
                String type = r.getAttribute("Type");
                if ("http://uri.etsi.org/01903#SignedProperties".equals(type)) {
                    spRef = r;
                } else if (r.getAttribute("URI") == null || r.getAttribute("URI").isEmpty()) {
                    contentRef = r;
                }
            }
            if (contentRef == null)
                throw new IllegalStateException("Reference du contenu non trouvée.");
            contentRef.setAttribute("Id", "r-id-frs");

            // e) Forcer URI du SignedProperties
            if (spRef != null)
                spRef.setAttribute("URI", "#xades-SigFrs");

            // f) Forcer Target du QualifyingProperties
            NodeList qpsList = dsSignature.getElementsByTagNameNS(XADES, "QualifyingProperties");
            if (qpsList.getLength() > 0) {
                ((Element) qpsList.item(0)).setAttribute("Target", "#SigFrs");
            }

            // g) Fixer DataObjectFormat
            NodeList sdoProps = dsSignature.getElementsByTagNameNS(XADES, "SignedDataObjectProperties");
            if (sdoProps.getLength() > 0) {
                Element sdo = (Element) sdoProps.item(0);
                NodeList dofList = sdo.getElementsByTagNameNS(XADES, "DataObjectFormat");
                if (dofList.getLength() > 0) {
                    Element dof = (Element) dofList.item(0);
                    dof.setAttribute("ObjectReference", "#r-id-frs");
                    NodeList mimes = dof.getElementsByTagNameNS(XADES, "MimeType");
                    Element mime;
                    if (mimes.getLength() > 0) {
                        mime = (Element) mimes.item(0);
                    } else {
                        mime = doc.createElementNS(XADES, "xades:MimeType");
                        dof.appendChild(mime);
                    }
                    mime.setTextContent("application/octet-stream");
                }
            }

            // h) Injecter les 3 transforms
            Element transforms = (Element) contentRef.getElementsByTagNameNS(DS, "Transforms").item(0);
            if (transforms == null) {
                transforms = doc.createElementNS(DS, "ds:Transforms");
                contentRef.insertBefore(transforms, contentRef.getFirstChild());
            }
            while (transforms.hasChildNodes())
                transforms.removeChild(transforms.getFirstChild());
            transforms.appendChild(mkXPath(doc, "not(ancestor-or-self::ds:Signature)"));
            transforms.appendChild(mkXPath(doc, "not(ancestor-or-self::RefTtnVal)"));
            Element t3 = doc.createElementNS(DS, "ds:Transform");
            t3.setAttribute("Algorithm", "http://www.w3.org/2001/10/xml-exc-c14n#");
            transforms.appendChild(t3);

            // Sauvegarde
            Transformer tf = TransformerFactory.newInstance().newTransformer();
            tf.setOutputProperty(OutputKeys.INDENT, "yes");
            tf.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            try (FileOutputStream fos = new FileOutputStream(new File(outputPath))) {
                tf.transform(new DOMSource(doc), new StreamResult(fos));
            }

            System.out.println("OK : " + outputPath);
        }
    }

    private static Element mkXPath(Document doc, String expr) {
        final String DS = "http://www.w3.org/2000/09/xmldsig#";
        Element t = doc.createElementNS(DS, "ds:Transform");
        t.setAttribute("Algorithm", "http://www.w3.org/TR/1999/REC-xpath-19991116");
        Element xp = doc.createElementNS(DS, "ds:XPath");
        xp.appendChild(doc.createTextNode(expr));
        t.appendChild(xp);
        return t;
    }
}
