import { AblyProvider } from "./context/AblyContext";
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
			<html lang="en">
				<body className="antialiased w-full bg-white font-sans">
					{children}
				</body>
			</html>
		</AblyProvider>
	);
}
