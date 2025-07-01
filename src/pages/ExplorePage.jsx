import React from "react";
import { useLocation } from "react-router-dom";
import GermanyMapReal from "./GermanyMapReal";

const ExplorePage = () => {
  const { pathname } = useLocation();

  // Logjikë për të dalluar qëllimin
  let purpose = "";
  if (pathname.startsWith("/buy")) {
    purpose = "buy";
  }
  if (pathname.startsWith("/rent")) {
    purpose = "rent";
  }

  return <GermanyMapReal purpose={purpose} />;
};

export default ExplorePage;
