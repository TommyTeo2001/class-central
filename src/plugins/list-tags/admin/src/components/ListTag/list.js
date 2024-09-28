import React, { useState, useEffect } from "react";
import {
  Typography,
  Flex,
  Box,
  Tag,
  Button,
  TextInput,
} from "@strapi/design-system";
import { Cross, Information, Plus, PlusCircle } from "@strapi/icons";
import { useIntl } from "react-intl";
import { IconButton } from "@strapi/design-system/IconButton";
import AddItemModal from "../AddListTagModal";

const Input = React.forwardRef((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } =
    props; // these are just some of the props passed by the content-manager

  const [tags, setTags] = useState([]);
  const [openAddTagModal, setOpenAddTagModal] = useState(false);

  useEffect(() => {
    if (value !== "null" && value !== null && value !== undefined) {
      setTags(JSON.parse(value));
    }
  }, [value]);

  const { formatMessage } = useIntl();

  const handleTagClick = (selectedValue) => () => {
    // Remove selected value from tags
    const newValue = tags.filter((val) => val !== selectedValue);
    if (onChange) {
      onChange({
        target: { name, type: attribute.type, value: JSON.stringify(newValue) },
      });
    }
  };

  const handleAddTag = (item) => {
    const newTags = [...tags, item];
    setTags(newTags);
    if (onChange) {
      onChange({
        target: { name, type: attribute.type, value: JSON.stringify(newTags) },
      });
      setOpenAddTagModal(false);
    }
  };

  return (
    <div>
      {openAddTagModal && (
        <AddItemModal
          setOpenAddTagModal={setOpenAddTagModal}
          handleAddTag={handleAddTag}
        />
      )}
      <label>
        <Typography
          fontWeight="bold"
          textColor="neutral800"
          as="h3"
          id="description"
        >
          {formatMessage(intlLabel)}
        </Typography>
      </label>
      <Flex
        overflow="auto"
        alignItems="center"
        justingContent="center"
        flexDirection="row"
        gap={3}
        width={"100%"}
        padding={2}
        background="neutral150"
        wrap="wrap"
      >
        <Flex
          alignItems="center"
          width={"100%"}
          justingContent="center"
          gap={1}
        >
          {tags.length > 0 ? (
            tags.map((item, index) => (
              <Tag
                key={index}
                label="remove filter"
                icon={<Cross aria-hidden />}
                onClick={handleTagClick(item)}
              >
                {item}
              </Tag>
            ))
          ) : (
            <Typography textColor="neutral800" as="h2" id="description">
              Empty
            </Typography>
          )}
        </Flex>
        <div>
          <Button
            startIcon={<Plus />}
            onClick={() => setOpenAddTagModal(true)}
          ></Button>
        </div>
      </Flex>
    </div>
  );
});

export default Input;
