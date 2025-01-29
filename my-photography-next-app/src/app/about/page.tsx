"use client";
import Image from "next/image";
import Link from "next/link";
import "./page.css";
import image from "../../../public/aboutImages/about_abey.jpeg";

export default function About() {
  return (
    <div className="about-container">
      {/* Bio Section */}
      <div className="about-box bio-section">
        <div className="profile-photo">
          <Image src={image} alt="Abey K Rajan" width={150} height={150} />
        </div>
        <h2>Abey K Rajan</h2>
        <p>Software Engineer | UI/UX Enthusiast | AI Researcher</p>
        <p>
          Email: <a href="mailto:abeyk1@umbc.edu">abeyk1@umbc.edu</a>
        </p>
        <p>
          LinkedIn:{" "}
          <a href="https://www.linkedin.com/in/abey-k-rajan/" target="_blank">
            abey-k-rajan
          </a>
        </p>
      </div>

      {/* Skills Section */}
      <div className="about-box skills-section">
        <h3>Skills</h3>
        <ul>
          <li>Frontend: React.js, Next.js, Vue.js, TypeScript</li>
          <li>Backend: Node.js, PHP, Java, Python</li>
          <li>Database: MySQL, MongoDB, PostgreSQL</li>
          <li>Cloud & DevOps: AWS, Docker, Azure</li>
          <li>AI & NLP: Hugging Face, Transformers, Python ML</li>
        </ul>
      </div>

      {/* Education Section */}
      <div className="about-box education-section">
        <h3>Education</h3>
        <p>
          <strong>University of Maryland, Baltimore County</strong>
        </p>
        <p>Master’s in Software Engineering (2023 - 2025) | GPA: 3.7</p>
        <p>
          <strong>Saintgits College of Engineering</strong>
        </p>
        <p>B.Tech in Computer Science & Engineering (2016 - 2020) | GPA: 3.3</p>
      </div>

      {/* Work Experience Section */}
      <div className="about-box experience-section">
        <h3>Work Experience</h3>
        <p>
          <strong>Research Assistant</strong> - UMBC (2024 - Present)
        </p>
        <p>
          Worked on AI-based documentation research at the Ethical Software Lab.
        </p>
        <p>
          <strong>Software Engineer</strong> - Infosys (2020 - 2023)
        </p>
        <p>
          Developed scalable applications and optimized performance in
          full-stack projects.
        </p>
      </div>

      {/* Photography Section */}
      <div className="about-box photography-section">
        <h3>Photography</h3>
        <p>
          Beyond coding, I have a passion for capturing moments through
          photography.
        </p>
        <p>Explore my gallery and discover my visual journey.</p>
        <Link href="/gallery" className="gallery-link">
          Click Here to View My Photography
        </Link>
      </div>
    </div>
  );
}
