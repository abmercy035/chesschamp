import { AblyProvider } from "./context/AblyContext";
import { ModalProvider } from "./context/ModalContext";
import "./globals.css";

export const metadata = {
	title: "ChessChamp",
	description: "Play chess online in real time!",
};

export default function RootLayout({
	children,
}) {
	return (
		<AblyProvider>
			<ModalProvider>
				<html lang="en">
					<body className="antialiased w-full font-sans chess-bg chess-text min-h-screen">
						{children}
					</body>
				</html>
			</ModalProvider>
		</AblyProvider>
	);
}
