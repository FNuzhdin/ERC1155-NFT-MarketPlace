"use client";

import React from "react";

import type { IsAdmin } from "./App";

type AdminInterfaceProps = {
  admin: IsAdmin
};

const AdminInterface: React.FC<AdminInterfaceProps> = ({ admin }) => {
  console.log("Component AdminInterface");

  const { adminToken, adminMarket } = admin; 
  return <div></div>;
};

export default AdminInterface;
