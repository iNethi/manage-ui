import React, { useState, useEffect } from 'react';
import {Container, ThemeProvider, Fab} from '@mui/material';
import DeviceList from "../components/DeviceList";
import Box from "@mui/material/Box";
import NavBar from "../components/NavBar";
import AddIcon from '@mui/icons-material/Add';
import ConfirmDeleteDialogue from "../components/ConfirmDeleteDialogue";
import Alert from '@mui/material/Alert';
import EditDeviceDialogue from "../components/EditDeviceDialogue";
import AddDeviceDialogue from "../components/AddDeviceDialogue";
import Footer from "../components/Footer";
import { useKeycloak } from "@react-keycloak/web";
function DevicePage() {
    const { keycloak } = useKeycloak();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deviceToDelete, setDeviceToDelete] = useState(null);
    const [devices, setDevices] = useState([]);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [successAlert, setSuccessAlert] = useState({ show: false, message: '' });
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [deviceToEdit, setDeviceToEdit] = useState({ name: '', ip_address: '', device_type: '' });
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const refreshTokenIfNeeded = async () => {

        if (keycloak.isTokenExpired()) {
            try {
                const refreshed = await keycloak.updateToken(5);
                if (refreshed) {
                    console.log('Token refreshed');
                } else {
                    console.log('Token not refreshed, still valid');
                }
            } catch (error) {
                console.error('Failed to refresh the token, or the session has expired');
                keycloak.login()
            }
        }
        else {
            console.log('not expired');
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await refreshTokenIfNeeded();
            fetch('https://manage-backend.inethilocal.net/devices/', {
                headers: {
                    'Authorization': `Bearer ${keycloak.token}`,
                },
            })
                .then(response => response.json())
                .then(data => setDevices(data))
                .catch(error => console.error('Error:', error));
        };
        fetchData();
    }, [keycloak]);


    const handleAddClick = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleAddDevice = (newDevice) => {
        setOpenAddDialog(false);

        fetch('https://manage-backend.inethilocal.net/add/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${keycloak.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newDevice),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                setSuccessAlert({ show: true, message: "Device successfully added." });
                fetchDevices(); // Re-fetch devices
            })
            .catch(error => {
                console.error('Error:', error);
                setAlert({ show: true, message: "Failed to add the device." });
            });
    };

    const fetchDevices = async () => {
        console.log('----keycloak token----')
        console.log(`${keycloak.token}`)
        await refreshTokenIfNeeded();
        fetch('https://manage-backend.inethilocal.net/devices/', {
            headers: {
                'Authorization': `Bearer ${keycloak.token}`,
            }
        })
            .then(response => response.json())
            .then(data => setDevices(data))
            .catch(error => console.error('Error:', error));
    };


    const handleEditClick = (device) => {
        setDeviceToEdit(device);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleUpdateDevice = (oldIpAddress, updatedDevice) => {
        setOpenEditDialog(false);
        fetch(`https://manage-backend.inethilocal.net/update/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${keycloak.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_ip_address: oldIpAddress,
                new_device_data: updatedDevice
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                setSuccessAlert({ show: true, message: "Device successfully updated." });
                fetchDevices();

            })
            .catch(error => {
                console.error('Error:', error);
                setAlert({ show: true, message: "Failed to update the device." });
            });
    };

    const handleDeleteClick = (device) => {
        setDeviceToDelete(device);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleConfirmDelete = () => {
        setOpenDeleteDialog(false);
        if (deviceToDelete) {
            // Perform API call to delete the device
            fetch(`https://manage-backend.inethilocal.net/delete/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${keycloak.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ip_address: deviceToDelete.ip_address }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(() => {
                    // Remove the deleted device from the state
                    setDevices(devices.filter(device => device.ip_address !== deviceToDelete.ip_address));
                    setSuccessAlert({show: true, message: "Device successfully deleted."})
                })
                .catch(error => {
                    console.error('Error:', error);
                    setAlert({ show: true, message: "Failed to remove the device. Please contact support." });
                });
        }
    };
    const handleCloseAlert = () => {
        setAlert({ show: false, message: '' });
    };
    const handleCloseSuccessAlert = () => {
        setSuccessAlert({ show: false, message: '' });
    };

    return (
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#26282d',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <NavBar />
                {alert.show && (
                    <Alert severity="error" onClose={handleCloseAlert}>
                        {alert.message}
                    </Alert>
                )}
                {successAlert.show && (
                    <Alert severity="success" onClose={handleCloseSuccessAlert}>
                        {successAlert.message}
                    </Alert>
                )}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'start',
                        padding: 2,
                        margin: 2,
                    }}
                >

                    <DeviceList devices={devices} onDelete={handleDeleteClick} onEdit={handleEditClick}/>
                    <ConfirmDeleteDialogue
                        open={openDeleteDialog}
                        handleClose={handleCloseDeleteDialog}
                        handleConfirm={handleConfirmDelete}
                    />
                    <EditDeviceDialogue
                        open={openEditDialog}
                        handleClose={handleCloseEditDialog}
                        device={deviceToEdit}
                        handleUpdate={handleUpdateDevice}
                    />
                </Box>
                <Fab
                    onClick={handleAddClick}
                    color="button_green"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        bottom: '95px',
                        right: 10,
                    }}
                >
                    <AddIcon />
                </Fab>

                <AddDeviceDialogue
                    open={openAddDialog}
                    handleClose={handleCloseAddDialog}
                    handleAdd={handleAddDevice}
                />
                <Footer />
            </Box>
    );
}

export default DevicePage;