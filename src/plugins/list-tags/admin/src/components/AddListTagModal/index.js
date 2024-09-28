import {
  Flex,
  Box,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  Loader,
  Dialog,
  DialogBody,
  DialogFooter,
  TextInput,
} from "@strapi/design-system";
import React, { useState } from "react";
import { WarningCircle } from "@strapi/icons";

const AddItemModal = ({ handleAddTag, setOpenAddTagModal }) => {
  const [item, setItem] = useState("");
  return (
    <ModalLayout
      onClose={() => setOpenAddTagModal(false)}
      labelledBy="Add item"
      as="form"
    >
      <ModalHeader>
        <Typography
          fontWeight="bold"
          fontSize="24px"
          id="title"
          as="h2"
          lineHeight="32px"
        >
          Add item to the list
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Box color="neutral800" padding={4} background="neutral0">
          <Flex direction="column" alignItems="stretch" gap={6}>
            <TextInput
              label="Item"
              placeholder="Item"
              size="M"
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </Flex>
          <Flex justifyContent="end" paddingTop={2}>
            <Button
              variant="primary"
              onClick={() => handleAddTag(item)}
              disabled={!item}
            >
              Add
            </Button>
          </Flex>
        </Box>
      </ModalBody>
    </ModalLayout>
  );
};

export default AddItemModal;
