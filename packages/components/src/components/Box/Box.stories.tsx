import React from "react";
import { Meta } from "@storybook/react";
import { Box } from ".";

const meta: Meta = {
  title: "Components/Box",
  component: Box,
};

export default meta;

export const Default: React.FC = () => (
  <Box
    css={{
      backgroundColor: "$gray400",
      color: "$text",
      border: "$colors$red500 solid $sizes$3",
      padding: "$4",
    }}
  >
    Box
  </Box>
);
