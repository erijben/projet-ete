// Importez les composants nécessaires de MUI, Formik, et Axios
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import React from 'react';
import axios from 'axios';



const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleAddEquipment = async (values) => {
    try {
      const newEquipment = {
        Nom: values.Nom,
        Type: values.Type,
        AdresseIp: values.AdresseIp,
        Emplacement: values.Emplacement,
        Etat: values.Etat,
      };

      // Affichez les données qui seront envoyées
      console.log("Nouvel équipement :", newEquipment);
      const response = await axios.post('http://localhost:3001/equip/add', newEquipment);

      console.log("Réponse du serveur :", response.data);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement :', error);
    }
  };
  return (
    <Box m="20px">
      <Header title="Ajouter un équipement" subtitle="Voir la liste des équipements" />

      <Formik
        onSubmit={handleAddEquipment}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit} method="POST">
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nom"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Nom}
                name="Nom"
                error={!!touched.Nom && !!errors.Nom}
                helperText={touched.Nom && errors.Nom}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Type"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Type}
                name="Type"
                error={!!touched.Type && !!errors.Type}
                helperText={touched.Type && errors.Type}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Adresse IP"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.AdresseIp}
                name="AdresseIp"
                error={!!touched.AdresseIp && !!errors.AdresseIp}
                helperText={touched.AdresseIp && errors.AdresseIp}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Emplacement"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Emplacement}
                name="Emplacement"
                error={!!touched.Emplacement && !!errors.Emplacement}
                helperText={touched.Emplacement && errors.Emplacement}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="État"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Etat}
                name="Etat"
                error={!!touched.Etat && !!errors.Etat}
                helperText={touched.Etat && errors.Etat}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Ajouter
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;


  const checkoutSchema = yup.object().shape({
    Nom: yup.string().required("required"),
    Type: yup.string().required("required"),
    AdresseIp: yup.string().required("required"),
    Emplacement: yup.string().required("required"),
    Etat: yup.string().required("required"),
  });
  
  const initialValues = {
    Nom: "",
    Type: "",
    AdresseIp: "",
    Emplacement: "",
    Etat: "",
  };
  


// ... (schéma de validation et valeurs initiales)

export default Form;
