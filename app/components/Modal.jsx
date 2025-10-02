'use client';

import { useEffect, useRef } from 'react';

const Modal = ({
	isOpen,
	onClose,
	title,
	message,
	type = 'alert', // 'alert', 'confirm', 'prompt'
	onConfirm,
	confirmText = 'OK',
	cancelText = 'Cancel',
	placeholder = '',
	inputValue = '',
	onInputChange,
	inputType = 'text'
}) => {
	const dialogRef = useRef(null);
	const inputRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			// Focus on input for prompt type, otherwise focus on confirm button
			if (type === 'prompt' && inputRef.current) {
				inputRef.current.focus();
			} else {
				const confirmButton = dialogRef.current?.querySelector('.modal-confirm-btn');
				if (confirmButton) {
					confirmButton.focus();
				}
			}
		}
	}, [isOpen, type]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!isOpen) return;

			if (e.key === 'Escape') {
				onClose();
			} else if (e.key === 'Enter') {
				if (type === 'prompt') {
					// Don't auto-confirm on Enter for prompt - user might be typing
					return;
				}
				if (type === 'confirm' && onConfirm) {
					onConfirm();
				} else {
					onClose();
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, type, onConfirm, onClose]);

	if (!isOpen) return null;

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		} else {
			onClose();
		}
	};

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div ref={dialogRef} className="modal-dialog">
				{title && <div className="modal-header">
					<h3 className="modal-title">{title}</h3>
				</div>}

				<div className="modal-body">
					{message && <p className="modal-message">{message}</p>}

					{type === 'prompt' && (
						<input
							ref={inputRef}
							type={inputType}
							value={inputValue}
							onChange={(e) => onInputChange && onInputChange(e.target.value)}
							placeholder={placeholder}
							className="modal-input"
						/>
					)}
				</div>

				<div className="modal-footer">
					{type === 'confirm' || type === 'prompt' ? (
						<>
							<button
								className="modal-btn modal-cancel-btn"
								onClick={onClose}
							>
								{cancelText}
							</button>
							<button
								className="modal-btn modal-confirm-btn"
								onClick={handleConfirm}
							>
								{confirmText}
							</button>
						</>
					) : (
						<button
							className="modal-btn modal-confirm-btn"
							onClick={onClose}
						>
							{confirmText}
						</button>
					)}
				</div>
			</div>

			<style jsx>{`
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: rgba(0, 0, 0, 0.7);
					backdrop-filter: blur(4px);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 9999;
					animation: fadeIn 0.2s ease-out;
				}
				
				.modal-dialog {
					background: linear-gradient(135deg, 
						var(--chess-bg-primary) 0%, 
						var(--chess-bg-secondary) 100%);
					border: 2px solid var(--chess-accent);
					border-radius: 12px;
					box-shadow: 
						0 20px 60px rgba(0, 0, 0, 0.5),
						0 0 0 1px rgba(255, 215, 0, 0.2),
						inset 0 1px 0 rgba(255, 255, 255, 0.1);
					max-width: 500px;
					width: 90%;
					max-height: 80vh;
					overflow: hidden;
					animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
				}
				
				.modal-header {
					padding: 20px 24px 16px;
					border-bottom: 1px solid rgba(255, 215, 0, 0.2);
				}
				
				.modal-title {
					color: var(--chess-accent);
					font-size: 1.25rem;
					font-weight: 600;
					margin: 0;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
				}
				
				.modal-body {
					padding: 24px;
				}
				
				.modal-message {
					color: var(--chess-text-primary);
					font-size: 1rem;
					line-height: 1.5;
					margin: 0 0 16px 0;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
				}
				
				.modal-input {
					width: 100%;
					padding: 12px 16px;
					background: rgba(0, 0, 0, 0.3);
					border: 2px solid rgba(255, 215, 0, 0.3);
					border-radius: 8px;
					color: var(--chess-text-primary);
					font-size: 1rem;
					transition: all 0.2s ease;
				}
				
				.modal-input:focus {
					outline: none;
					border-color: var(--chess-accent);
					box-shadow: 
						0 0 0 3px rgba(255, 215, 0, 0.2),
						inset 0 1px 3px rgba(0, 0, 0, 0.3);
				}
				
				.modal-input::placeholder {
					color: var(--chess-text-secondary);
				}
				
				.modal-footer {
					padding: 16px 24px 20px;
					border-top: 1px solid rgba(255, 215, 0, 0.2);
					display: flex;
					gap: 12px;
					justify-content: flex-end;
				}
				
				.modal-btn {
					padding: 10px 20px;
					border: none;
					border-radius: 6px;
					font-size: 0.95rem;
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s ease;
					text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
					position: relative;
					overflow: hidden;
				}
				
				.modal-btn::before {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(90deg, 
						transparent, 
						rgba(255, 255, 255, 0.2), 
						transparent);
					transition: left 0.5s;
				}
				
				.modal-btn:hover::before {
					left: 100%;
				}
				
				.modal-confirm-btn {
					background: linear-gradient(135deg, #4CAF50, #45a049);
					color: white;
					box-shadow: 0 3px 10px rgba(76, 175, 80, 0.3);
				}
				
				.modal-confirm-btn:hover {
					background: linear-gradient(135deg, #45a049, #3d8b40);
					transform: translateY(-1px);
					box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
				}
				
				.modal-confirm-btn:active {
					transform: translateY(0);
				}
				
				.modal-cancel-btn {
					background: linear-gradient(135deg, #666, #555);
					color: white;
					box-shadow: 0 3px 10px rgba(102, 102, 102, 0.3);
				}
				
				.modal-cancel-btn:hover {
					background: linear-gradient(135deg, #777, #666);
					transform: translateY(-1px);
					box-shadow: 0 5px 15px rgba(102, 102, 102, 0.4);
				}
				
				.modal-cancel-btn:active {
					transform: translateY(0);
				}
				
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				
				@keyframes slideIn {
					from { 
						opacity: 0;
						transform: scale(0.9) translateY(-20px);
					}
					to { 
						opacity: 1;
						transform: scale(1) translateY(0);
					}
				}
				
				@media (max-width: 768px) {
					.modal-dialog {
						margin: 20px;
						max-height: calc(100vh - 40px);
					}
					
					.modal-footer {
						flex-direction: column;
					}
					
					.modal-btn {
						width: 100%;
					}
				}
			`}</style>
		</div>
	);
};

export default Modal;
