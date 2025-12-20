import type { FC } from "hono/jsx";

const Layout: FC = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://cdn.tailwindcss.com"></script>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
					rel="stylesheet"
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `
      .geist-regular {
         font-family: "Geist", sans-serif;
         font-optical-sizing: auto;
         font-weight: 400;
         font-style: normal;
      }
				.geist-mono {
         font-family: "Geist Mono", sans-serif;
         font-optical-sizing: auto;
         font-weight: 400;
         font-style: normal;
      }
         .custom-box-shadow {
box-shadow: 3.5px 3.5px 0px 0px #dddddd;
         }


				`,
					}}
				/>
			</head>
			<body>
				<div class="geist-regular min-h-screen px-6 py-10 sm:px-8 sm:py-14">
					<main class="mx-auto max-w-2xl flex flex-col gap-8">
						<h1 class="text-2xl font-semibold tracking-tight">
							SQLite over email
						</h1>
						<div class="flex flex-col gap-6">{props.children}</div>
					</main>
				</div>
			</body>
		</html>
	);
};

export default Layout;
