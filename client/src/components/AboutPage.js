import React from "react";
import "../CSS/AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Our Platform</h1>

        <section className="about-section">
          <h2>Marketing Plan</h2>
          <p>
            Our aim and envision for this platform is to be able to sell itself as a learning platform primarily targeted at universities and polytechnics and ultimately leaning towards collaborations with private industries.
          </p>
          <p>
            Connecting students as potential employees through internships to employers that are able to recognize their hard work and professionally develop skillsets relevant to their background to help them thrive in the work force.
          </p>
          <p>
            With that being said, students and employers are going to play very important roles in how we approach our marketing efforts. Strong public relations and partnerships between us, educational institutes and industry partners will be essential in ensuring the platform's success. The focus is to build upon and lean heavily into our B2B services to support long-term scalability without compromising on the quality of our offerings.
          </p>

          <h3>Approach</h3>
          <p>
            We will develop a team of public relations / sales that has been extensively trained on the platform's capabilities and real-world use cases to help communicate the platform's value proposition to key stakeholders from educational institutes and industry partners where they will build trust and encourage them to adopt our platform and integrate it into their operations.
          </p>
          <p>
            From there on, adoption of the platform and sale of product will be discussed based on how our platform can accommodate their specific needs and preferences and integrate into their existing infrastructure.
          </p>

          <h3>Sale of the Product</h3>
          <p>
            <strong>Subscription based service per month.</strong> This aligns well with the service we provide because we can send out regular updates, addition of new features and ongoing hosting and tech support.
          </p>
          <p>
            Different tiers of subscriptions enable these parties the freedom to choose depending on how much they want to scale.
          </p>
          <ul>
            <li>Educational institutions can choose different tiers depending on how many students they want to be using on the platform</li>
            <li>Industry partners can choose based on the scale of how much students and educational institutions they are able to outreach and benefit from their collaborations</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Future Enhancements</h2>

          <div className="enhancement-card">
            <h3>AI Study Assistant</h3>
            <p>
              An interface of this study assistant could be the size of a chatbox by the sides of the website that can be pulled up when the student does not understand the study material and needs quick clarification where the AI study assistant can swiftly provide assistance and clarification.
            </p>
            <p>
              The advantage of having this on the platform is so that students can effortlessly make quick adjustments to their knowledge while staying on the same page as the material.
            </p>
            <ul>
              <li>A recap of the previous lesson which integrates back into the current lesson to make sure the students are up to date with the material</li>
              <li>Summary which breaks down what the student has gone through in the current lesson and displays the summarized points</li>
            </ul>
          </div>

          <div className="enhancement-card">
            <h3>Job Path Recommendations</h3>
            <p>
              Since most students don't know what they actually want to do after their studying path is completed, understanding what and how they study can help their employability in the future and shape their study choices towards what they might want to have a career in.
            </p>
            <p>
              A page dedicated to understanding the possibilities and skillsets that students learn can show them a career path roadmap and what it takes to get towards those goals if they want to. Also demonstrating their learned courses and skills that can relate to certain career prospects.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;