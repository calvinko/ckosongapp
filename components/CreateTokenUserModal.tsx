import React, { useState } from "react"
import Select from "react-select"
import toast from "react-hot-toast"
import { useSWRConfig } from "swr";

import GenericModal from "./GenericModal";
import { Button, Text, TextField, Flex } from "./base";
import { UserRoleOptions } from "../lib/constants";
import { createTokenUser } from "../lib/tokens/uiToken";

/**
 * Modal for creating token users
 */
const CreateTokenUserModal = ({
  modalIsOpen,
  closeModal,
}: {
  modalIsOpen: boolean;
  closeModal: () => void;
}) => {
  const { mutate } = useSWRConfig()

  const [nameValue, setNameValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectIsOpen, setSelectIsOpen] = useState(false);

  /**
   * Handle select role changes
   * 
   * @param selectedOptions selected options in the react-select dropdown
   */
  const handleSelectRolesChange = (selectedOptions) => {
    setSelectedRoles(selectedOptions.map((option) => option?.value));
  }

  /**
   * Handle Name text field change
   */
  const handleNameTextChange = (e) => {
    setNameValue(e.target.value);
  }

  /**
   * Handle location text field change
   */
  const handleLocationTextChange = (e) => {
    setLocationValue(e.target.value);
  }

  /**
   * Handle the creation of the token user... whenever the create button is pressed
   */
  const handleCreateTokenUser = async () => {
    try {
      await createTokenUser(nameValue, locationValue, selectedRoles)
      toast.success("Created Token User for " + nameValue);
      mutate("/api/admin/tokens")
      setNameValue("");
      setLocationValue("");
      setSelectedRoles([]);
      closeModal();
    } catch (err) {
      toast.error("Could not create token user. " + err);
    }
  }

  return (
    <GenericModal
      modalIsOpen={modalIsOpen}
      closeModal={closeModal}
      title={<>Create Token User</>}
      className={`create-token-user-modal-box top-10 md:top-14 ${selectIsOpen ? "modal-min-height-open" : ""}`}
    >
      <Flex flexDirection="column" className="w-full">
        <Text as="span" fontSize="14px" color="#444">
          Name
        </Text>
        <div className="textfield-box">
          <TextField
            aria-label="Enter name"
            autoComplete=""
            id="name-input"
            lines={1}
            type="input"
            placeholder="Enter name"
            value={nameValue}
            onChange={handleNameTextChange}
          />
        </div>
        <Text as="span" fontSize="14px" color="#444" className="mt-2">
          Location
        </Text>
        <div className="textfield-box">
          <TextField
            aria-label="Enter location"
            autoComplete=""
            id="location-input"
            lines={1}
            type="input"
            placeholder="Enter location"
            value={locationValue}
            onChange={handleLocationTextChange}
          />
        </div>
        <div className="text-sm mt-2">
          <Text as="span" fontSize="14px" color="#444">
            Roles
          </Text>
          <Select
            isMulti
            name="select-user-roles"
            options={UserRoleOptions}
            className="user-select"
            onChange={handleSelectRolesChange}
            onMenuOpen={() => { setSelectIsOpen(true) }}
            onMenuClose={() => { setSelectIsOpen(false) }}
          />
        </div>
      </Flex>
      <div className="create-token-footer">
        <Button
          className="text-white bg-white bg-green-700 mr-2"
          onClick={handleCreateTokenUser}
        >
          Create
        </Button>
        <Button
          outline
          shadow={false}
          className="text-gray-900 bg-white"
          onClick={closeModal}
        >
          Close
        </Button>
      </div>
      <style jsx>{`
        .user-select {
          font-size: 12px;
        }
        .textfield-box {
          width: 100%;
          display: flex;
          font-size: 10px;
          cursor: pointer;
        }
        .create-token-footer {
          position: fixed;
          bottom: 16px;
        }
      `}</style>
    </GenericModal >
  )
}

export default CreateTokenUserModal