import React from "react";
import { Box, Typography, Container } from "@mui/material";

export default function InstitutionWelcome() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#1e40af" }}>
          Welcome, Institution!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          This is the institution dashboard welcome page.
        </Typography>
      </Container>
    </Box>
  );
}
