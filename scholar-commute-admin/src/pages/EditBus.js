// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   updateDoc,
//   addDoc,
//   setDoc,
// } from "firebase/firestore";
// import { db } from "../firebase/config";
// import {
//   Container,
//   Typography,
//   Box,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Button,
//   TextField,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { Delete, Edit, Save, Add } from "@mui/icons-material";

// const StyledPaper = ({ children }) => (
//   <Paper
//     elevation={3}
//     sx={{
//       padding: 3,
//       marginBottom: 3,
//       borderRadius: 2,
//       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//       backgroundColor: "#f9f9f9",
//     }}
//   >
//     {children}
//   </Paper>
// );

// const EditBus = () => {
//   const { busId } = useParams();
//   const navigate = useNavigate();

//   const [bus, setBus] = useState(null);
//   const [routeId, setRouteId] = useState(null);
//   const [stops, setStops] = useState([]);
//   const [copyStops, setCopyStops] = useState([]);
//   const [allStops, setAllStops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [newStop, setNewStop] = useState("");
//   const [newStopDetails, setNewStopDetails] = useState({
//     name: "",
//     lat: "",
//     lng: "",
//   });
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [addingOther, setAddingOther] = useState(false);
//   const [refresh, setRefresh] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch bus data
//         const busDoc = await getDoc(doc(db, "buses", busId));
//         if (!busDoc.exists()) {
//           alert("Bus not found");
//           navigate("/bus-management");
//           return;
//         }
//         const busData = busDoc.data();
//         setBus(busData);
//         setRouteId(busData.current_route_no);

//         // Determine stops source based on isDefault
//         let stopsData = [];
//         if (busData.isDefault) {
//           // Fetch stops from default_routes
//           const routeDoc = await getDoc(
//             doc(db, "default_routes", busData.current_route_no)
//           );
//           stopsData = routeDoc.exists() ? routeDoc.data().stops || [] : [];
//         } else {
//           // Fetch stops from copy_routes with bus_no_{bus_no} document
//           const copyRouteDoc = await getDoc(
//             doc(db, "copy_routes", busData.current_route_no)
//           );
//           stopsData = copyRouteDoc.exists()
//             ? copyRouteDoc.data().stops || []
//             : [];
//           console.log(stopsData);
//         }
//         setStops(stopsData);
//         setCopyStops(stopsData);

//         const latLngDocRef = doc(db, "stops", "lat_lng");
//         const latLngDocSnap = await getDoc(latLngDocRef);

//         const latLngData = latLngDocSnap.data();
//         const stopsList = Object.entries(latLngData).map(([name, coords]) => ({
//           name,
//           latitude: coords[1],
//           longitude: coords[2],
//         }));
//         setAllStops(stopsList);

//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [busId, navigate, refresh]);

//   const handleDeleteStop = (index) => {
//     const newStops = [...copyStops];
//     newStops.splice(index, 1);
//     setCopyStops(newStops);
//   };

//   const handleAddStopClick = () => {
//     setNewStop("");
//     setAddingOther(false);
//     setNewStopDetails({ name: "", lat: "", lng: "" });
//     setOpenAddDialog(true);
//   };

//   const handleAddStopChange = (event) => {
//     const value = event.target.value;
//     setNewStop(value);
//     if (value === "Other") {
//       setAddingOther(true);
//     } else {
//       setAddingOther(false);
//     }
//   };

//   const handleNewStopDetailsChange = (field) => (event) => {
//     setNewStopDetails({ ...newStopDetails, [field]: event.target.value });
//   };

//   const handleAddStopConfirm = async () => {
//     let stopName = newStop;
//     if (addingOther) {
//       // Add new stop to stops collection lat_lng document with lat=0 and lng=1
//       try {
//         const docRef = await addDoc(collection(db, "stops"), {
//           stopname: newStopDetails.name,
//           lat: 0,
//           lng: 1,
//         });
//         stopName = newStopDetails.name;
//         // Refresh allStops list
//         setAllStops([
//           ...allStops,
//           { id: docRef.id, stopname: stopName, lat: 0, lng: 1 },
//         ]);
//       } catch (error) {
//         console.error("Error adding new stop:", error);
//         alert("Failed to add new stop");
//         return;
//       }
//     }
//     setCopyStops([...copyStops, stopName]);
//     setOpenAddDialog(false);
//   };

//   const handleSave = async () => {
//     try {
//       // Save stops names only to copy_routes collection for routeId
//       const copyRoutesRef = doc(db, "copy_routes", routeId);
//       await updateDoc(copyRoutesRef, { stops: copyStops }).catch(
//         async (error) => {
//           if (error.code === "not-found") {
//             // If document doesn't exist, create it
//             await setDoc(copyRoutesRef, { stops: copyStops });
//           } else {
//             throw error;
//           }
//         }
//       );

//       // Update stops field in buses collection for this bus and set isDefault false
//       const busRef = doc(db, "buses", busId);
//       await updateDoc(busRef, { isDefault: false });

//       const timestamp = Date.now().toString();
//       const notifiRef = doc(db, "notifications", timestamp);
//       await setDoc(notifiRef, {
//         message: `Bus no ${bus?.bus_no} updated with new stops`,
//         timestamp: new Date().toISOString(),
//       });

//       setStops(copyStops);
//       setEditMode(false);
//       alert("Stops saved successfully");
//     } catch (error) {
//       console.error("Error saving stops:", error);
//       alert("Failed to save stops");
//     }
//   };

//   if (loading) {
//     return <Typography>Loading...</Typography>;
//   }

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <StyledPaper>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 3,
//           }}
//         >
//           <Typography variant="h4" sx={{ fontWeight: "bold" }}>
//             Bus {bus?.bus_no}
//           </Typography>
//           <Button
//             variant="outlined"
//             color="secondary"
//             onClick={async () => {
//               try {
//                 const busRef = doc(db, "buses", busId);
//                 await updateDoc(busRef, { isDefault: true });
//                 setRefresh(true);
//                 alert("Reverted to routine successfully");
//               } catch (error) {
//                 console.error("Error reverting to routine:", error);
//                 alert("Failed to revert to routine");
//               }
//             }}
//           >
//             Revert to Routine
//           </Button>
//         </Box>

//         <Box sx={{ mb: 2 }}>
//           {!editMode && (
//             <Button
//               variant="contained"
//               startIcon={<Edit />}
//               onClick={() => setEditMode(true)}
//             >
//               Edit Stops
//             </Button>
//           )}
//           {editMode && (
//             <>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<Save />}
//                 onClick={handleSave}
//                 sx={{ mr: 2 }}
//               >
//                 Save
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={() => {
//                   setCopyStops(stops);
//                   setEditMode(false);
//                 }}
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//         </Box>

//         <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "#fff" }}>
//           <List>
//             {copyStops.map((stop, index) => (
//               <ListItem
//                 key={index}
//                 secondaryAction={
//                   editMode && (
//                     <IconButton
//                       edge="end"
//                       aria-label="delete"
//                       onClick={() => handleDeleteStop(index)}
//                     >
//                       <Delete />
//                     </IconButton>
//                   )
//                 }
//               >
//                 <ListItemText primary={stop} />
//               </ListItem>
//             ))}
//           </List>
//         </Paper>

//         {editMode && (
//           <>
//             <Button
//               variant="outlined"
//               startIcon={<Add />}
//               onClick={handleAddStopClick}
//               sx={{ mt: 2 }}
//             >
//               Add Stop
//             </Button>

//             <Dialog
//               open={openAddDialog}
//               onClose={() => setOpenAddDialog(false)}
//             >
//               <DialogTitle>Add Stop</DialogTitle>
//               <DialogContent>
//                 <FormControl fullWidth sx={{ mt: 2 }}>
//                   <InputLabel id="select-stop-label">Select Stop</InputLabel>
//                   <Select
//                     labelId="select-stop-label"
//                     value={newStop}
//                     label="Select Stop"
//                     onChange={handleAddStopChange}
//                   >
//                     {allStops.map((stop) => (
//                       <MenuItem
//                         key={stop.id}
//                         value={stop.stopname || stop.name}
//                       >
//                         {stop.stopname || stop.name}
//                       </MenuItem>
//                     ))}
//                     <MenuItem value="Other">Other</MenuItem>
//                   </Select>
//                 </FormControl>

//                 {addingOther && (
//                   <>
//                     <TextField
//                       label="Stop Name"
//                       fullWidth
//                       sx={{ mt: 2 }}
//                       value={newStopDetails.name}
//                       onChange={handleNewStopDetailsChange("name")}
//                     />
//                     <TextField
//                       label="Latitude"
//                       fullWidth
//                       sx={{ mt: 2 }}
//                       type="number"
//                       s
//                       value={newStopDetails.lat}
//                       onChange={handleNewStopDetailsChange("lat")}
//                     />
//                     <TextField
//                       label="Longitude"
//                       fullWidth
//                       sx={{ mt: 2 }}
//                       type="number"
//                       value={newStopDetails.lng}
//                       onChange={handleNewStopDetailsChange("lng")}
//                     />
//                   </>
//                 )}
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
//                 <Button onClick={handleAddStopConfirm} variant="contained">
//                   Add
//                 </Button>
//               </DialogActions>
//             </Dialog>
//           </>
//         )}
//       </StyledPaper>
//     </Container>
//   );
// };

// export default EditBus;
// ✅ Add at the top with other imports
// import axios from "axios";

// // 🔁 Replace useEffect fetchData with backend API calls
// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       // 1️⃣ Get bus data
//       const busRes = await axios.get(`/api/buses/${busId}`);
//       const busData = busRes.data;
//       setBus(busData);
//       setRouteId(busData.current_route_no);

//       // 2️⃣ Get route stops from default or copy
//       const routeStopsRes = await axios.get(
//         `/api/routes/${busData.current_route_no}/stops?source=${
//           busData.isDefault ? "default" : "copy"
//         }`
//       );
//       const stopsData = routeStopsRes.data.stops;
//       setStops(stopsData);
//       setCopyStops(stopsData);

//       // 3️⃣ Get all stops (lat_lng doc)
//       const latLngDocSnap = await axios.get("/api/stops");
//       const stopsList = latLngDocSnap.data.map(({ name, map }) => ({
//         name,
//         latitude: map[1],
//         longitude: map[2],
//       }));
//       setAllStops(stopsList);

//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };
//   fetchData();
// }, [busId, navigate, refresh]);

// // ✅ Confirm stop addition (from Dialog)
// const handleAddStopConfirm = async () => {
//   let stopName = newStop;
//   if (addingOther) {
//     try {
//       const res = await axios.post("/api/stops/add", {
//         stopname: newStopDetails.name,
//         lat: 0,
//         lng: 1,
//       });
//       stopName = res.data.stopname;
//       setAllStops([...allStops, res.data]);
//     } catch (error) {
//       console.error("Error adding new stop:", error);
//       alert("Failed to add new stop");
//       return;
//     }
//   }
//   setCopyStops([...copyStops, stopName]);
//   setOpenAddDialog(false);
// };

// // ✅ Save updated stops to backend
// const handleSave = async () => {
//   try {
//     await axios.post(`/api/routes/${routeId}/save-stops`, {
//       stops: copyStops,
//     });

//     await axios.post(`/api/buses/${busId}/set-default`, {
//       value: false,
//     });

//     await axios.post("/api/notifications", {
//       message: `Bus no ${bus?.bus_no} updated with new stops`,
//     });

//     setStops(copyStops);
//     setEditMode(false);
//     alert("Stops saved successfully");
//   } catch (error) {
//     console.error("Error saving stops:", error);
//     alert("Failed to save stops");
//   }
// };

// // ✅ Revert to routine
// <Button
//   variant="outlined"
//   color="secondary"
//   onClick={async () => {
//     try {
//       await axios.post(`/api/buses/${busId}/set-default`, {
//         value: true,
//       });
//       setRefresh(!refresh);
//       alert("Reverted to routine successfully");
//     } catch (error) {
//       console.error("Error reverting to routine:", error);
//       alert("Failed to revert to routine");
//     }
//   }}
// >
//   Revert to Routine
// </Button>;
// ✅ Converted to use backend APIs instead of Firestore
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit, Save, Add } from "@mui/icons-material";

const StyledPaper = ({ children }) => (
  <Paper
    elevation={3}
    sx={{
      padding: 3,
      marginBottom: 3,
      borderRadius: 2,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      backgroundColor: "#f9f9f9",
    }}
  >
    {children}
  </Paper>
);

const EditBus = () => {
  const { busId } = useParams();
  console.log("Bus id ", busId);
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [routeId, setRouteId] = useState(null);
  const [stops, setStops] = useState([]);
  const [copyStops, setCopyStops] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newStop, setNewStop] = useState("");
  const [newStopDetails, setNewStopDetails] = useState({
    name: "",
    lat: "",
    lng: "",
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addingOther, setAddingOther] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const busRes = await axios.get(
          `http://localhost:5000/api/buses/${busId}`
        );
        const busData = busRes.data;
        console.log("BUS DATA :", busData);
        setBus(busData);
        setRouteId(busData.current_route_no);
        const route_type = busData.isDefault ? "default" : "copy";
        const stopsRes = await axios.get(
          `http://localhost:5000/api/routes/${busData.current_route_no}/stops?source=${route_type}`
        );
        const stopsData = stopsRes.data.stops;
        setStops(stopsData);
        setCopyStops(stopsData);

        const latLngRes = await axios.get("http://localhost:5000/api/stops");
        console.log("LAT AND LONG :", latLngRes);
        console.log("LAT AND LONG DATA :", latLngRes.data);
        const stopsList = Object.entries(stopsData).map(([name, coords]) => ({
          name,
          latitude: coords[0],
          longitude: coords[1],
        }));

        setAllStops(stopsList);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [busId, navigate, refresh]);

  const handleDeleteStop = (index) => {
    const newStops = [...copyStops];
    newStops.splice(index, 1);
    setCopyStops(newStops);
  };

  const handleAddStopClick = () => {
    setNewStop("");
    setAddingOther(false);
    setNewStopDetails({ name: "", lat: "", lng: "" });
    setOpenAddDialog(true);
  };

  const handleAddStopChange = (event) => {
    const value = event.target.value;
    setNewStop(value);
    setAddingOther(value === "Other");
  };

  const handleNewStopDetailsChange = (field) => (event) => {
    setNewStopDetails({ ...newStopDetails, [field]: event.target.value });
  };

  const handleAddStopConfirm = async () => {
    let stopName = newStop;
    console.log("NEW STOP DETAILS :", newStopDetails);
    if (addingOther) {
      try {
        const res = await axios.post("http://localhost:5000/api/stops/add", {
          stopname: newStopDetails.name,
          lat: 0,
          lng: 1,
        });
        stopName = res.data.stopname;
        setAllStops([...allStops, res.data]);
      } catch (error) {
        console.error("Error adding new stop:", error);
        alert("Failed to add new stop");
        return;
      }
    }
    setCopyStops([...copyStops, stopName]);
    setOpenAddDialog(false);
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/routes/${routeId}/save-stops`,
        {
          stops: copyStops,
        }
      );
      await axios.post(`http://localhost:5000/api/buses/${busId}/set-default`, {
        value: false,
      });
      await axios.post("http://localhost:5000/api/notifications", {
        message: `Bus no ${bus?.bus_no} updated with new stops`,
      });

      setStops(copyStops);
      setEditMode(false);
      alert("Stops saved successfully");
    } catch (error) {
      console.error("Error saving stops:", error);
      alert("Failed to save stops");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StyledPaper>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Bus {bus?.bus_no}
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={async () => {
              try {
                await axios.post(
                  `http://localhost:5000/api/buses/${busId}/set-default`,
                  {
                    value: true,
                  }
                );
                setRefresh(!refresh);
                alert("Reverted to routine successfully");
              } catch (error) {
                console.error("Error reverting to routine:", error);
                alert("Failed to revert to routine");
              }
            }}
          >
            Revert to Routine
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          {!editMode && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Edit Stops
            </Button>
          )}
          {editMode && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ mr: 2 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCopyStops(stops);
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>

        <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "#fff" }}>
          <List>
            {copyStops.map((stop, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  editMode && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteStop(index)}
                    >
                      <Delete />
                    </IconButton>
                  )
                }
              >
                <ListItemText primary={stop} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {editMode && (
          <>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddStopClick}
              sx={{ mt: 2 }}
            >
              Add Stop
            </Button>

            <Dialog
              open={openAddDialog}
              onClose={() => setOpenAddDialog(false)}
            >
              <DialogTitle>Add Stop</DialogTitle>
              <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="select-stop-label">Select Stop</InputLabel>
                  <Select
                    labelId="select-stop-label"
                    value={newStop}
                    label="Select Stop"
                    onChange={handleAddStopChange}
                  >
                    {allStops.map(
                      (
                        stop //had changed here from idx->stop.id
                      ) => (
                        <MenuItem
                          key={stop.id}
                          value={stop.stopname || stop.name}
                        >
                          {stop.stopname || stop.name}
                        </MenuItem>
                      )
                    )}
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                {addingOther && (
                  <>
                    <TextField
                      label="Stop Name"
                      fullWidth
                      sx={{ mt: 2 }}
                      value={newStopDetails.name}
                      onChange={handleNewStopDetailsChange("name")}
                    />
                    <TextField
                      label="Latitude"
                      fullWidth
                      sx={{ mt: 2 }}
                      type="number"
                      value={newStopDetails.lat}
                      onChange={handleNewStopDetailsChange("lat")}
                    />
                    <TextField
                      label="Longitude"
                      fullWidth
                      sx={{ mt: 2 }}
                      type="number"
                      value={newStopDetails.lng}
                      onChange={handleNewStopDetailsChange("lng")}
                    />
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddStopConfirm} variant="contained">
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </StyledPaper>
    </Container>
  );
};

export default EditBus;
