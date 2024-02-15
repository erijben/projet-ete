import { Box, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from "axios";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";





const Ping = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pingResults, setPingResults] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/pingResults');
        if (response.status === 200) {
          const data = response.data;
          console.log('Ping Results:', data); // Add this line
          setPingResults(data);
        } else {
          console.error('Error fetching data. HTTP Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
 
  const columns = [
    {
      field: "ID",
      headerName: "ID",
      flex: 2,
      cellClassName: "name-column--cell",
    },
    {
      field: "size",
      headerName: "Size",
      flex: 2,
      cellClassName: "name-column--cell",
    },
    {
      field: "temps",
      headerName: "Temps",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 2,
    },
    {
      field: "TTL",
      headerName: "TTL",
      type: "number",
      headerAlign: "left",
      align: "left",
      flex: 2,
    },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 2,
    },
  ];

  return (
    <Box m="20px">
      <Header subtitle="Historique de ping" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
     <DataGrid
  checkboxSelection
  rows={pingResults}
  columns={columns}
  getRowId={(row) => row._id}
     />
      </Box>
    </Box>
  );
};

export default Ping;
