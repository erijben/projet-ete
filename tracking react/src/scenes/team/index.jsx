import React, { useState, useEffect } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from 'axios';

const Team = () => {
  const theme = useTheme();
  const [equipData, setEquipData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/equip");
        const transformedData = response.data.map(row => ({
          ...row,
          id: row._id,  // Add an 'id' property with the value of '_id'
        }));
        setEquipData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleButton1Click = (row) => {
    // Logic to handle button 1 action here
  };

  const handleButton2Click = (row) => {
    // Logic to handle button 2 action here
  };

  const handlePingButtonClick = async (row) => {
    try {
      const hostname = row?.Nom;
  
      if (!hostname) {
        console.error('Hostname is undefined');
        return;
      }
  
      const pingResponse = await axios.post('http://localhost:3001/ping', { hostname });
  
      // Assuming the response from the server contains the ping result
      const pingResult = pingResponse.data;
  
      console.log('Ping Result:', pingResult);
  
      // Add logic to update the state or perform any other actions with pingResult
    } catch (error) {
      console.error('Error during ping request:', error);
    }
  };
  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "Nom",
      headerName: "Nom",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "Type",
      headerName: "Type",
      type: "String",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
    },
    {
      field: "AdresseIp",
      headerName: "Adresse IP",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "Emplacement",
      headerName: "Emplacement",
      type: "String",
      headerAlign: "center",
      align: "center",
      flex: 3,
    },
    {
      field: "Etat",
      headerName: "Etat",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
    },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" mt="10px">
          <Button onClick={() => handleButton1Click(params.row)} color="secondary" variant="contained" size="small">
            Modifier
          </Button>
          <Button onClick={() => handleButton2Click(params.row)} color="secondary" variant="contained" size="small">
            Supprimer
          </Button>
          <Button onClick={() => handlePingButtonClick(params.row)} color="secondary" variant="contained" size="small">
            Ping
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="EQUIPEMENT" subtitle="LISTE D'EQUIPEMNT " />
      <Box
        m="10px 10px 10px 10px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: theme.palette.success.main,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.primary.main,
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: theme.palette.primary.main,
          },
          "& .MuiCheckbox-root": {
            color: theme.palette.success.light,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          loading={loading}
          rows={equipData}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Team;
