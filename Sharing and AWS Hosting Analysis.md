# TeenyAI: Sharing and AWS Hosting Analysis

## Introduction
This report analyzes the `TeenyAI` project, an AI-powered lightweight browser built with Electron, React, and TypeScript, to provide comprehensive recommendations on how to share the application with other users and explore the feasibility and methods for hosting it on Amazon Web Services (AWS).

`TeenyAI` is designed as a desktop application, leveraging Electron to combine web browsing capabilities with AI assistance. Understanding its distribution and potential cloud hosting options is crucial for its broader adoption and accessibility.

## Understanding TeenyAI's Nature and Deployment Strategy

`TeenyAI` is fundamentally an Electron application. Electron allows for the development of desktop GUI applications using web technologies (Chromium and Node.js). This means that while the user interface and logic are built using web-based frameworks like React and TypeScript, the final product is a native desktop application for Windows, macOS, and Linux, not a web application that runs directly in a browser.

### Key Characteristics:
*   **Desktop Application**: `TeenyAI` is packaged as a standalone executable for various operating systems.
*   **Technology Stack**: It utilizes React 18, TypeScript, Vite for the frontend, Electron for the desktop framework, Zustand for state management, OpenAI API for AI integration, and Playwright for web crawling.
*   **Production Ready**: The `README.md` states it "Can be packaged as a standalone desktop app," indicating that the project is set up for creating distributable binaries.
*   **Packaging Scripts**: The `package.json` includes scripts like `npm run package`, `npm run package:win`, and `npm run package:mac`, which are used to build the application for distribution on different platforms.

This desktop-first nature has significant implications for both sharing the application and hosting it on cloud platforms like AWS.

## Sharing Electron Desktop Applications

Sharing an Electron application like `TeenyAI` primarily involves distributing the packaged executable files to end-users. Unlike web applications that are accessed via a URL, desktop applications require users to download and install them on their local machines. Several tools and methods facilitate this process [1].

### Common Distribution Methods:

#### 1. Manual Packaging and Distribution
Electron applications can be manually packaged by downloading Electron's prebuilt binaries and placing the application's code in a specific directory structure. However, this method is cumbersome and generally not recommended for end-user distribution due to the lack of installers and auto-update mechanisms.

#### 2. Using Packaging Tools (Recommended)
Specialized tools simplify the process of packaging, signing, and creating installers for Electron applications across different operating systems. The `TeenyAI` project already includes `electron-builder.config.js`, suggesting `electron-builder` is the intended tool for this purpose. Other popular tools include `electron-forge` and `electron-packager` [2].

**`electron-builder`**:
`electron-builder` is a comprehensive solution that handles:
*   **Packaging**: Bundling the application code and Electron runtime into a single distributable unit.
*   **Installer Creation**: Generating platform-specific installers (e.g., `.exe` for Windows, `.dmg` for macOS, `.deb`/`.rpm` for Linux).
*   **Auto-Update Integration**: Facilitating over-the-air updates for the application, which is crucial for maintaining security and delivering new features.
*   **Code Signing**: Ensuring the application's authenticity and integrity, which is vital for user trust and bypassing OS security warnings.

The `TeenyAI` `package.json` contains scripts like `npm run package`, `npm run package:win`, and `npm run package:mac`. These scripts likely leverage `electron-builder` (or a similar tool) to generate the distributable files for each platform. To share the browser with others, one would execute these commands, obtain the generated installers/executables, and then distribute them.

#### 3. Distribution Platforms
Once packaged, the application can be distributed through various channels:
*   **Direct Download**: Hosting the installers on a website or cloud storage (e.g., AWS S3) for users to download directly.
*   **App Stores**: Submitting the application to platform-specific app stores (e.g., Microsoft Store, Mac App Store, Snapcraft for Linux). This often involves additional packaging and compliance requirements.
*   **Third-Party Services**: Utilizing services like Gumroad [3] or other platforms that handle hosting, versioning, and update notifications.

### Sharing Process for TeenyAI:
1.  **Build for Production**: Run `npm run build` to compile the React frontend and prepare the application for packaging.
2.  **Package for Target OS**: Execute `npm run package:win`, `npm run package:mac`, or a generic `npm run package` to create the distributable files for Windows, macOS, or Linux, respectively.
3.  **Distribute**: Share the generated installer files (e.g., `.exe`, `.dmg`, `.AppImage`) with other users via direct download links, app stores, or other distribution platforms.
4.  **Implement Auto-Updates**: For a production-ready application, integrating an auto-update mechanism (often supported by `electron-builder` in conjunction with cloud storage like AWS S3 and CloudFront [4]) is highly recommended to ensure users always have the latest version.

## Hosting Electron Applications on AWS

Hosting a traditional Electron desktop application directly on AWS in the same way one hosts a web application (e.g., on EC2, S3, or Lambda) is not straightforward because Electron apps require a graphical environment to run. However, there are several approaches to make desktop applications accessible via cloud infrastructure, primarily through application streaming or containerization for specific use cases.

### 1. Application Streaming (Recommended for User Access)
For providing users with access to a desktop application without requiring them to install it locally, application streaming services are the most suitable option. AWS offers **Amazon AppStream 2.0** [5, 6].

**Amazon AppStream 2.0**:
AppStream 2.0 is a fully managed service that allows you to stream desktop applications from AWS to any device running a web browser. Users access a virtualized instance of the application, and the graphical output is streamed to their browser. This means:
*   **No Local Installation**: Users do not need to download or install `TeenyAI`.
*   **Any Device, Any Browser**: Access is possible from various devices (laptops, tablets, thin clients) using a standard web browser.
*   **Centralized Management**: `TeenyAI` can be centrally managed, updated, and scaled on AWS.
*   **Security**: Applications run on AWS infrastructure, and only encrypted pixels are streamed to end-user devices, enhancing data security.
*   **Use Case**: This is ideal for scenarios where you want to provide `TeenyAI` as a Software-as-a-Service (SaaS) offering or to a distributed workforce.

**How to Host TeenyAI on AppStream 2.0:**
1.  **Package TeenyAI**: First, package `TeenyAI` into a distributable format (e.g., an `.exe` for Windows) using `electron-builder`.
2.  **Create an AppStream Image**: Upload the packaged `TeenyAI` application to an AppStream 2.0 image builder. Configure the environment, install any necessary dependencies, and test the application.
3.  **Create a Fleet and Stack**: Define a fleet (a group of EC2 instances running your application) and a stack (which connects users to the fleet).
4.  **User Access**: Grant users access to the AppStream stack, typically through a web portal or integration with identity providers.

### 2. Containerization (for Development/CI/CD or Specific Server-Side Tasks)
While Electron applications are primarily GUI-based, they can be containerized using Docker. This is generally not for end-user distribution in the same way AppStream is, but rather for development, testing, or running specific headless tasks (if `TeenyAI` had such capabilities) on servers [7, 8].

**Docker and AWS Container Services (ECS, EKS, Fargate)**:
*   **Docker**: An Electron app can be run within a Docker container, but displaying the GUI typically requires X-server forwarding or VNC, which adds complexity [9].
*   **AWS ECS/EKS/Fargate**: These services are designed for orchestrating and running Docker containers. If `TeenyAI` had a headless mode or a server-side component, these services could host those components. However, running the full GUI Electron application for end-users directly on these services is not their primary use case and would involve significant overhead for graphical streaming.

**Use Case for Containerization with TeenyAI**: If `TeenyAI` were to evolve to include a backend service (e.g., for AI processing or data storage) that needs to run independently of the desktop client, that backend could be containerized and deployed on AWS ECS or EKS. The Electron desktop client would then communicate with this cloud-hosted backend.

### 3. Hosting Distribution Files on AWS S3
For direct download distribution, AWS S3 (Simple Storage Service) is an excellent choice for hosting the packaged `TeenyAI` installers. S3 provides highly durable, scalable, and cost-effective object storage [4].

**How to use S3 for Distribution:**
1.  **Upload Installers**: After packaging `TeenyAI` for various platforms, upload the `.exe`, `.dmg`, `.deb`, etc., files to an S3 bucket.
2.  **Generate Public URLs**: Configure the S3 bucket to allow public read access to these files, or generate pre-signed URLs for controlled access.
3.  **Integrate with Auto-Updater**: S3 can be used as the backend for Electron's auto-update mechanisms, allowing the application to check for and download new versions directly from S3.
4.  **CloudFront**: For improved download performance and reduced latency, especially for a global user base, integrate Amazon CloudFront (a Content Delivery Network) with the S3 bucket.

## Comprehensive Recommendations

### For Sharing TeenyAI with Others:

1.  **Utilize `electron-builder` for Packaging**: Leverage the existing `electron-builder` configuration (or set it up if not fully configured) to create robust, platform-specific installers (`.exe`, `.dmg`, `.deb`, `.AppImage`). This is the standard and most efficient way to prepare `TeenyAI` for distribution.
2.  **Implement Auto-Updates**: Integrate an auto-update mechanism using `electron-builder` in conjunction with a hosting solution like AWS S3 and CloudFront. This ensures users always have the latest version, including bug fixes and new AI features, without manual intervention.
3.  **Choose a Distribution Channel**: Decide on the primary distribution method:
    *   **Direct Download**: Host installers on a dedicated website or an S3 bucket. This offers maximum control but requires you to manage updates (though auto-updates help).
    *   **App Stores**: Consider submitting to relevant app stores for broader reach, but be prepared for their specific review processes and guidelines.

### For Hosting TeenyAI on AWS:

1.  **For End-User Access (SaaS Model)**: **Amazon AppStream 2.0** is the recommended solution. It allows `TeenyAI` to be streamed to users via a web browser, eliminating local installation and providing centralized management, scalability, and enhanced security. This is the closest equivalent to 


running a web application, but for a desktop application.

2.  **For Hosting Distribution Files**: Use **AWS S3** (optionally with CloudFront) to host the packaged application installers. This is a cost-effective and scalable solution for providing download links and serving as a backend for auto-update mechanisms.

3.  **For Backend Services (Future Consideration)**: If `TeenyAI` evolves to include server-side components (e.g., for more intensive AI processing, user data storage, or real-time collaboration features), these components could be containerized using Docker and deployed on AWS services like **Amazon ECS**, **Amazon EKS**, or **AWS Fargate**. This would decouple the backend from the desktop client and allow for scalable, managed backend infrastructure.

## Conclusion

`TeenyAI`, as an Electron desktop application, is designed for local installation and execution. Sharing it with others involves packaging it into platform-specific installers using tools like `electron-builder` and distributing these installers. For a seamless user experience, integrating an auto-update mechanism is crucial.

When considering AWS, direct hosting of the desktop application for end-user interaction is best achieved through **Amazon AppStream 2.0**, which streams the application to a web browser. Alternatively, AWS S3 provides a robust platform for hosting the application's distribution files, supporting direct downloads and auto-updates. Future backend components could leverage AWS container services for scalability and management.

By following these recommendations, the `TeenyAI` project can effectively reach a wider audience and potentially evolve into a cloud-powered desktop experience.

## References

[1] Distribution Overview. Electron. (n.d.). Retrieved from [https://electronjs.org/docs/latest/tutorial/distribution-overview](https://electronjs.org/docs/latest/tutorial/distribution-overview)
[2] A Comprehensive Guide to Building and Packaging an Electron App. Steven K Lambert. (2021, March 7). Retrieved from [https://stevenklambert.com/writing/comprehensive-guide-building-packaging-electron-app/](https://stevenklambert.com/writing/comprehensive-guide-building-packaging-electron-app/)
[3] Best way to distribute an Electron app? Indie Hackers. (2018, March 9). Retrieved from [https://www.indiehackers.com/forum/best-way-to-distribute-an-electron-app-d5d7c1d3d8](https://www.indiehackers.com/forum/best-way-to-distribute-an-electron-app-d5d7c1d3d8)
[4] Building an Auto-Updating Electron App with AWS S3, CloudFront, and Terraform. DEV Community. (2025, May 7). Retrieved from [https://dev.to/alishah730/building-an-auto-updating-electron-app-with-aws-s3-cloudfront-and-terraform-57c](https://dev.to/alishah730/building-an-auto-updating-electron-app-with-aws-s3-cloudfront-and-terraform-57c)
[5] Amazon AppStream 2.0 - AWS. Amazon Web Services. (n.d.). Retrieved from [https://aws.amazon.com/appstream2/](https://aws.amazon.com/appstream2/)
[6] What Is Amazon AppStream 2.0? AWS Documentation. (n.d.). Retrieved from [https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
[7] How to run an electron app on docker. Stack Overflow. (n.d.). Retrieved from [https://stackoverflow.com/questions/39930223/how-to-run-an-electron-app-on-docker](https://stackoverflow.com/questions/39930223/how-to-run-an-electron-app-on-docker)
[8] How to Deploy a Node.js Application to AWS Using Docker, AWS ECR, and AWS App Runner. Medium. (n.d.). Retrieved from [https://medium.com/@accardo.steven/how-to-deploy-a-node-js-application-to-aws-using-docker-aws-ecr-and-aws-app-runner-5dd8c90c7684](https://medium.com/@accardo.steven/how-to-deploy-a-node-js-application-to-aws-using-docker-aws-ecr-and-aws-app-runner-5dd8c90c7684)
[9] Bundle docker with electron app. Reddit. (n.d.). Retrieved from [https://www.reddit.com/r/docker/comments/9yflm4/bundle_docker_with_electron_app/](https://www.reddit.com/r/docker/comments/9yflm4/bundle_docker_with_electron_app/)




## Deploying and Sharing React Applications

`TeenyAI` utilizes React for its renderer process, meaning the user interface within the Electron application is a React application. While this React app is embedded within the desktop client, React applications can also be deployed independently as web applications. Sharing a React application typically involves deploying it to a web server or a static site hosting service, making it accessible via a URL [10].

### Key Characteristics of React Applications:
*   **Client-Side Rendering**: React applications are primarily client-side, meaning the browser downloads the JavaScript, HTML, and CSS, and then React renders the UI dynamically.
*   **Static Assets**: After building, a React application typically results in a set of static files (HTML, CSS, JavaScript bundles, images, etc.) that can be served by any web server.
*   **API Interaction**: Many React applications interact with backend APIs to fetch or send data. In `TeenyAI`'s case, the React frontend communicates with the Electron main process via IPC, which then interacts with the OpenAI API.

### Methods for Deploying and Sharing React Applications:

#### 1. Static Site Hosting (Most Common and Recommended)
Since a built React application consists of static files, it can be easily hosted on static site hosting services or Content Delivery Networks (CDNs). This is often the most cost-effective and performant way to deploy React apps [11].

**Popular Static Hosting Services:**
*   **Netlify**: Offers continuous deployment from Git repositories, automatic SSL, and global CDN. It's known for its ease of use for React apps [12].
*   **Vercel**: Similar to Netlify, Vercel provides seamless deployment for frontend frameworks, including React, with built-in CI/CD and global edge network [13].
*   **GitHub Pages**: A free option for hosting static websites directly from a GitHub repository. Suitable for personal projects or open-source documentation [14].
*   **AWS Amplify**: A comprehensive service for building, deploying, and hosting full-stack web and mobile applications. It integrates well with React and other frontend frameworks, offering continuous deployment and backend services [15].
*   **AWS S3 with CloudFront**: React applications can be hosted directly on an S3 bucket configured for static website hosting. Integrating with CloudFront provides a global CDN for faster content delivery and SSL termination [16]. This is a highly scalable and cost-effective solution for static assets.
*   **Azure Static Web Apps**: Microsoft's service for hosting static web apps with integrated CI/CD from GitHub [17].

**Deployment Process:**
1.  **Build the React App**: Run `npm run build` (or `yarn build`) in the React project directory. This command compiles the React source code into an optimized `build` (or `dist`) folder containing the static assets.
2.  **Upload to Hosting Service**: Upload the contents of the `build` folder to the chosen static hosting service. Most services offer direct integration with Git repositories, automatically building and deploying changes on every push.
3.  **Access via URL**: Once deployed, the React application will be accessible via a public URL provided by the hosting service.

#### 2. Server-Side Rendering (SSR) or Static Site Generation (SSG)
For React applications that require better SEO, faster initial load times, or dynamic content that needs to be rendered on the server, frameworks like Next.js or Gatsby can be used. These approaches generate HTML on the server or at build time.

*   **Next.js**: Supports SSR and SSG, and can be deployed on platforms like Vercel, Netlify, or self-hosted on Node.js servers (e.g., AWS EC2, AWS Lambda with API Gateway).
*   **Gatsby**: Primarily for SSG, generating static HTML files that can be hosted on any static site hosting service.

#### 3. Sharing React Components
If the goal is to share reusable React components rather than an entire application, tools like Bit.dev or publishing them as NPM packages (discussed in the next section) are appropriate. This allows other React projects to easily import and use these components [18].

## Publishing and Sharing NPM Packages

NPM (Node Package Manager) is the default package manager for Node.js and is widely used for sharing JavaScript libraries, tools, and reusable code modules. `TeenyAI` itself uses many NPM packages as dependencies, and its own components or utilities could potentially be published as NPM packages for reuse in other projects [19].

### Types of NPM Packages:
*   **Public Packages**: Accessible to anyone via the public npm registry. Ideal for open-source libraries or components intended for broad use.
*   **Private Packages**: Accessible only to you and your chosen collaborators or within an organization. Useful for proprietary code or internal libraries [20].

### Methods for Publishing and Sharing NPM Packages:

#### 1. Publishing to the Public npm Registry
This is the standard way to share open-source JavaScript packages. The process involves:
1.  **Create a `package.json`**: Ensure your project has a `package.json` file with essential metadata (name, version, description, main entry point, etc.).
2.  **Login to npm**: Use `npm login` in your terminal to authenticate with your npm account.
3.  **Publish**: Navigate to your package's root directory and run `npm publish`. If it's a scoped package (e.g., `@yourorg/mypackage`), you might need `npm publish --access public` for public visibility [21].

#### 2. Publishing Private NPM Packages
For sharing code within a team or organization without making it publicly available, private NPM packages are used. This requires an npm paid plan or using private registries.

**Options for Private Packages:**
*   **npm Private Modules**: npm offers private modules as part of its paid plans, allowing you to publish scoped packages that are only visible to specified users or teams [22].
*   **GitHub Packages**: GitHub Packages is a package hosting service that allows you to host private (and public) packages alongside your code. It integrates seamlessly with GitHub repositories and offers a free tier for private packages [23].
*   **Self-Hosted Private Registries**: Solutions like Verdaccio or Nexus Repository Manager allow you to run your own private npm registry within your infrastructure. This gives full control over package management and access [24].
*   **AWS CodeArtifact**: A fully managed artifact repository service that supports npm, Maven, and PyPI. It allows organizations to store, publish, and share packages securely within AWS, integrating with other AWS services and IAM for access control.

#### 3. Sharing Locally or via Git
For very small teams or during early development, packages can be shared without publishing to a registry:
*   **`npm link`**: Creates a symlink to a local package, allowing you to test it in another local project as if it were installed from npm.
*   **Git URLs**: You can specify a Git repository URL directly in your `package.json` dependencies. npm will clone the repository and install it as a dependency. This is suitable for private packages hosted on private Git servers [25].

### TeenyAI and NPM Packages:
`TeenyAI` itself is an application, not primarily a library to be consumed as an NPM package. However, if specific modules or components within `TeenyAI` (e.g., a custom Electron utility, a React component library, or a shared AI service client) were to be extracted for reuse in other projects, they could be published as NPM packages using the methods described above. For internal reuse, private packages via GitHub Packages or AWS CodeArtifact would be ideal.

## Comprehensive Recommendations (Updated)

### For Sharing TeenyAI with Others (Electron Application):

1.  **Utilize `electron-builder` for Packaging**: Leverage the existing `electron-builder` configuration (or set it up if not fully configured) to create robust, platform-specific installers (`.exe`, `.dmg`, `.deb`, `.AppImage`). This is the standard and most efficient way to prepare `TeenyAI` for distribution.
2.  **Implement Auto-Updates**: Integrate an auto-update mechanism using `electron-builder` in conjunction with a hosting solution like AWS S3 and CloudFront. This ensures users always have the latest version, including bug fixes and new AI features, without manual intervention.
3.  **Choose a Distribution Channel**: Decide on the primary distribution method:
    *   **Direct Download**: Host installers on a dedicated website or an S3 bucket. This offers maximum control but requires you to manage updates (though auto-updates help).
    *   **App Stores**: Consider submitting to relevant app stores for broader reach, but be prepared for their specific review processes and guidelines.

### For Hosting TeenyAI on AWS (Electron Application):

1.  **For End-User Access (SaaS Model)**: **Amazon AppStream 2.0** is the recommended solution. It allows `TeenyAI` to be streamed to users via a web browser, eliminating local installation and providing centralized management, scalability, and enhanced security. This is the closest equivalent to running a web application, but for a desktop application.

2.  **For Hosting Distribution Files**: Use **AWS S3** (optionally with CloudFront) to host the packaged application installers. This is a cost-effective and scalable solution for providing download links and serving as a backend for auto-update mechanisms.

3.  **For Backend Services (Future Consideration)**: If `TeenyAI` evolves to include server-side components (e.g., for more intensive AI processing, user data storage, or real-time collaboration features), these components could be containerized using Docker and deployed on AWS services like **Amazon ECS**, **Amazon EKS**, or **AWS Fargate**. This would decouple the backend from the desktop client and allow for scalable, managed backend infrastructure.

### For Deploying and Sharing TeenyAI's React Frontend (as a standalone web app, if desired):

1.  **Build for Production**: Always run `npm run build` to generate optimized static assets.
2.  **Choose a Static Hosting Service**: Deploy the `build` folder to a static site hosting service. Recommended options include:
    *   **AWS Amplify**: For continuous deployment and integration with other AWS services.
    *   **AWS S3 with CloudFront**: For highly scalable and performant static site hosting.
    *   **Netlify or Vercel**: For ease of use and continuous deployment from Git.
3.  **Consider SSR/SSG**: If SEO or initial load performance is critical for a standalone web version, explore frameworks like Next.js or Gatsby.

### For Publishing and Sharing TeenyAI's NPM Packages (for reusable modules):

1.  **Public Packages**: For open-source utilities or components, publish to the **public npm registry** using `npm publish`.
2.  **Private Packages**: For internal or proprietary modules, consider:
    *   **GitHub Packages**: For seamless integration with GitHub repositories.
    *   **AWS CodeArtifact**: For a fully managed, secure artifact repository within AWS.
    *   **Self-hosted private registries**: For complete control over your package management.

## References (Updated)

[1] Distribution Overview. Electron. (n.d.). Retrieved from [https://electronjs.org/docs/latest/tutorial/distribution-overview](https://electronjs.org/docs/latest/tutorial/distribution-overview)
[2] A Comprehensive Guide to Building and Packaging an Electron App. Steven K Lambert. (2021, March 7). Retrieved from [https://stevenklambert.com/writing/comprehensive-guide-building-packaging-electron-app/](https://stevenklambert.com/writing/comprehensive-guide-building-packaging-electron-app/)
[3] Best way to distribute an Electron app? Indie Hackers. (2018, March 9). Retrieved from [https://www.indiehackers.com/forum/best-way-to-distribute-an-electron-app-d5d7c1d3d8](https://www.indiehackers.com/forum/best-way-to-distribute-an-electron-app-d5d7c1d3d8)
[4] Building an Auto-Updating Electron App with AWS S3, CloudFront, and Terraform. DEV Community. (2025, May 7). Retrieved from [https://dev.to/alishah730/building-an-auto-updating-electron-app-with-aws-s3-cloudfront-and-terraform-57c](https://dev.to/alishah730/building-an-auto-updating-electron-app-with-aws-s3-cloudfront-and-terraform-57c)
[5] Amazon AppStream 2.0 - AWS. Amazon Web Services. (n.d.). Retrieved from [https://aws.amazon.com/appstream2/](https://aws.amazon.com/appstream2/)
[6] What Is Amazon AppStream 2.0? AWS Documentation. (n.d.). Retrieved from [https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
[7] How to run an electron app on docker. Stack Overflow. (n.d.). Retrieved from [https://stackoverflow.com/questions/39930223/how-to-run-an-electron-app-on-docker](https://stackoverflow.com/questions/39930223/how-to-run-an-electron-app-on-docker)
[8] How to Deploy a Node.js Application to AWS Using Docker, AWS ECR, and AWS App Runner. Medium. (n.d.). Retrieved from [https://medium.com/@accardo.steven/how-to-deploy-a-node-js-application-to-aws-using-docker-aws-ecr-and-aws-app-runner-5dd8c90c7684](https://medium.com/@accardo.steven/how-to-deploy-a-node-js-application-to-aws-using-docker-aws-ecr-and-aws-app-runner-5dd8c90c7684)
[9] Bundle docker with electron app. Reddit. (n.d.). Retrieved from [https://www.reddit.com/r/docker/comments/9yflm4/bundle_docker_with_electron_app/](https://www.reddit.com/r/docker/comments/9yflm4/bundle_docker_with_electron_app/)
[10] Deployment. Create React App. (n.d.). Retrieved from [https://create-react-app.dev/docs/deployment/](https://create-react-app.dev/docs/deployment/)
[11] How to Choose the Right Hosting For React App in 2024? Medium. (n.d.). Retrieved from [https://medium.com/@rajdeepsinhgohil/how-to-choose-the-right-hosting-for-react-app-deployment-a00539b5ea5e](https://medium.com/@rajdeepsinhgohil/how-to-choose-the-right-hosting-for-react-app-deployment-a00539b5ea5e)
[12] Deploy React on Netlify - Starter Templates & Resources. Netlify. (n.d.). Retrieved from [https://www.netlify.com/with/react/](https://www.netlify.com/with/react/)
[13] How To Deploy A React App To Vercel (Simple). YouTube. (n.d.). Retrieved from [https://www.youtube.com/watch?v=hAuyNf0Uk-w](https://www.youtube.com/watch?v=hAuyNf0Uk-w)
[14] GitHub Pages. Create React App. (n.d.). Retrieved from [https://create-react-app.dev/docs/deployment/#github-pages](https://create-react-app.dev/docs/deployment/#github-pages)
[15] Task 1: Deploy and Host a React App - AWS. Amazon.com. (n.d.). Retrieved from [https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-one/](https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-one/)
[16] Where should I host a react website? Reddit. (n.d.). Retrieved from [https://www.reddit.com/r/reactjs/comments/pczkwk/where_should_i_host_a_react_website/](https://www.reddit.com/r/reactjs/comments/pczkwk/where_should_i_host_a_react_website/)
[17] Deploy a React app on Azure Static Web Apps. Microsoft Learn. (n.d.). Retrieved from [https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-react](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-react)
[18] Sharing React Components across Multiple Applications. Bits and Pieces. (2021, June 16). Retrieved from [https://blog.bitsrc.io/sharing-react-components-across-multiple-applications-a407b5a15186](https://blog.bitsrc.io/sharing-react-components-across-multiple-applications-a407b5a15186)
[19] How to Create and Publish an NPM Package – a Step-by-Step Guide. freeCodeCamp.org. (2023, February 1). Retrieved from [https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/](https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/)
[20] About private packages. npm Docs. (n.d.). Retrieved from [https://docs.npmjs.com/about-private-packages/](https://docs.npmjs.com/about-private-packages/)
[21] Creating and publishing scoped public packages. npm Docs. (n.d.). Retrieved from [https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
[22] Creating and publishing private packages. npm Docs. (n.d.). Retrieved from [https://docs.npmjs.com/creating-and-publishing-private-packages/](https://docs.npmjs.com/creating-and-publishing-private-packages/)
[23] Publishing a Private Npm Package using GitHub Packages. Medium. (n.d.). Retrieved from [https://medium.com/@infobilel/publishing-a-private-npm-package-using-github-packages-45fc7bc89b24](https://medium.com/@infobilel/publishing-a-private-npm-package-using-github-packages-45fc7bc89b24)
[24] Can you host a private repository for your organization to use with npm. Stack Overflow. (n.d.). Retrieved from [https://stackoverflow.com/questions/7575627/can-you-host-a-private-repository-for-your-organization-to-use-with-npm](https://stackoverflow.com/questions/7575627/can-you-host-a-private-repository-for-your-organization-to-use-with-npm)
[25] Share private NPM packages across projects. Reddit. (n.d.). Retrieved from [https://www.reddit.com/r/Frontend/comments/102dmm6/share_private_npm_packages_across_projects/](https://www.reddit.com/r/Frontend/comments/102dmm6/share_private_npm_packages_across_projects/)


