import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();

const MinimalApp = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div>Minimal App Working</div>} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default MinimalApp;