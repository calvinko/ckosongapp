import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment } from "react";

/**
 * Generic Modal to use
 */
const GenericModal = ({
  modalIsOpen,
  closeModal,
  title,
  children,
  className
}: {
  modalIsOpen: boolean;
  closeModal: () => void;
  includeCloseBtn?: boolean
  title?: JSX.Element | string | null
  children: JSX.Element | JSX.Element[] | null,
  className?: string | null
}) => {

  return (
    <Transition appear show={modalIsOpen} as={Fragment}>
      <Dialog as="div" className="relative z-1000" onClose={closeModal}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-30" />
        </Transition.Child>

        {/* Center the modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${className || ''}`}>
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {title}
                </Dialog.Title>

                <div className="w-full">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <style jsx>{`
          .row-item {
            padding: 4px 0;
            border-bottom: 1px solid #eaeaea;
            width: 100%;
          }
        `}</style>
      </Dialog>
    </Transition>
  )
}

export default GenericModal