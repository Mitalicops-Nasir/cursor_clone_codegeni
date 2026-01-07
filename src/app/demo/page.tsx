"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const DemoPage = () => {
  const [textBlocking, setTextBlocking] = useState("");
  const [textBackground, setTextBackground] = useState("");
  const [loadingBlocking, setLoadingBlocking] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);
  const handleBooking = async () => {
    setLoadingBlocking(true);
    const response = await fetch("/api/demo/blocking", {
      method: "POST",
    });

    const data = await response.json();

    setTextBlocking(JSON.stringify(data));
    console.log(data);
    setLoadingBlocking(false);
  };

  const handleBackground = async () => {
    setLoadingBackground(true);
    const response = await fetch("/api/demo/background", {
      method: "POST",
    });

    const data = await response.json();

    setTextBackground(JSON.stringify(data));
    console.log(data);
    setLoadingBackground(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-8 space-x-4">
        <Button disabled={loadingBlocking} onClick={handleBooking}>Blocking</Button>

        <p className="mt-2">{textBlocking || "No data"}</p>
      </div>

      <div className="p-8 space-x-4">
        <Button disabled={loadingBackground} onClick={handleBackground}>Background</Button>

        <p className="mt-2">{textBackground || "No data"}</p>
      </div>
    </div>
  );
};

export default DemoPage;
