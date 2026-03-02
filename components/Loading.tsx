import React from "react";
import Placeholder from "./Placeholder";
import { Box } from "./base"

/**
 * Component to show placeholders for loading UI
 */
const Loading = () => {
  return (
    <Box className="max-w-[95%] md:max-w-lg my-16 mx-6 md:mx-auto">
      <Placeholder fluid>
        <Placeholder.Header>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Header>
        {[...Array(5)].map((e, index) => (
          <Placeholder.Paragraph key={`loading-placeholder-${index}`}>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
        ))}
      </Placeholder>
    </Box>
  );
};

export default Loading;
