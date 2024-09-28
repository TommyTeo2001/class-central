import React, { useEffect } from "react";
import { Alert, Box, Flex } from "@strapi/design-system";

const Notification = ({
  showNotification,
  setShowNotification,
  width,
  message,
  variant,
  title,
}) => {
  useEffect(() => {
    if (!!showNotification) {
      setTimeout(() => {
        setShowNotification(false);
      }, 7000);
    }
  }, [showNotification]);
  return (
    <>
      {showNotification && (
        <Box zIndex={100} position="absolute" width={width}>
          <Flex direction="column" alignItems="end">
            <Alert
              closeLabel="Close"
              title={title}
              variant={variant}
              onClose={() => setShowNotification(false)}
            >
              {message}
            </Alert>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default Notification;
