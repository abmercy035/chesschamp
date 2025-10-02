'use client';

import { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext();

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};

export const ModalProvider = ({ children }) => {
	const [modal, setModal] = useState({
		isOpen: false,
		type: 'alert',
		title: '',
		message: '',
		onConfirm: null,
		confirmText: 'OK',
		cancelText: 'Cancel',
		placeholder: '',
		inputValue: '',
		inputType: 'text'
	});

	const closeModal = () => {
		setModal(prev => ({ ...prev, isOpen: false }));
	};

	const showAlert = (message, title = '', confirmText = 'OK') => {
		return new Promise((resolve) => {
			setModal({
				isOpen: true,
				type: 'alert',
				title,
				message,
				confirmText,
				onConfirm: () => {
					closeModal();
					resolve(true);
				}
			});
		});
	};

	const showConfirm = (message, title = '', confirmText = 'OK', cancelText = 'Cancel') => {
		return new Promise((resolve) => {
			setModal({
				isOpen: true,
				type: 'confirm',
				title,
				message,
				confirmText,
				cancelText,
				onConfirm: () => {
					closeModal();
					resolve(true);
				},
				onClose: () => {
					closeModal();
					resolve(false);
				}
			});
		});
	};

	const showPrompt = (message, defaultValue = '', title = '', placeholder = '', inputType = 'text', confirmText = 'OK', cancelText = 'Cancel') => {
		return new Promise((resolve) => {
			let currentValue = defaultValue;

			setModal({
				isOpen: true,
				type: 'prompt',
				title,
				message,
				confirmText,
				cancelText,
				placeholder,
				inputValue: defaultValue,
				inputType,
				onInputChange: (value) => {
					currentValue = value;
					setModal(prev => ({ ...prev, inputValue: value }));
				},
				onConfirm: () => {
					closeModal();
					resolve(currentValue);
				},
				onClose: () => {
					closeModal();
					resolve(null);
				}
			});
		});
	};

	const handleInputChange = (value) => {
		if (modal.onInputChange) {
			modal.onInputChange(value);
		}
	};

	const handleClose = () => {
		if (modal.onClose) {
			modal.onClose();
		} else {
			closeModal();
		}
	};

	return (
		<ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
			{children}
			<Modal
				isOpen={modal.isOpen}
				type={modal.type}
				title={modal.title}
				message={modal.message}
				confirmText={modal.confirmText}
				cancelText={modal.cancelText}
				placeholder={modal.placeholder}
				inputValue={modal.inputValue}
				inputType={modal.inputType}
				onConfirm={modal.onConfirm}
				onClose={handleClose}
				onInputChange={handleInputChange}
			/>
		</ModalContext.Provider>
	);
};
