import React from "react";
import { Container, Box, Typography, Link } from "@mui/material";

export default function RegisterPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Register Students
        </Typography>
        <Link
          href="https://face-collector-app.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          sx={{
            fontSize: "1.2rem",
            color: "#1976d2",
            "&:hover": {
              color: "#115293",
            },
          }}
        >
          Go to Registration Page
        </Link>
      </Box>
    </Container>
  );
}
