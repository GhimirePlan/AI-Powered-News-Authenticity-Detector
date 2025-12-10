import React, { useEffect, useRef, useState } from "react";
import "./HomePage.scss";
import "./popup.scss";
// SwiperJs for Carousel
import { Swiper, SwiperSlide } from "swiper/react";
import { SpinnerCircular } from "spinners-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Navigation } from "swiper";

// Image imports

// Video Imports

function HomePage() {
  const settingsprops = {};
  const openPopup = () => {
    settingsprops.MainUIFrame.showModal();
  };
  const [reviews, setReviews] = useState([])
  useEffect(() => {
    fetch("/getReviews")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setReviews([]); // Set empty array on error
      });
  }, [])
  return (
    <>
      <main className="homepage">
        <section className="header padding ">
          <video id="bg-video" autoPlay loop muted playsInline>
            <source
              src={window.getStatic("assets/bggg3.mp4")}
              type="video/webm"
            />
            <source
              src={window.getStatic("assets/bggg3.mp4")}
              type="video/mp4"
            />
          </video>
          <div className="header__brand " id="tsparticles">
            <h1 className="hidden-title">
              Satya's Lie Guard: Fake News Detector AI
            </h1>
            <img
              src={window.getStatic("assets/logo1.png")}
              alt="Satya's Lie Guard: Fake News Detector AI"
              className="header__brand__icon"
            />
            <p className="header__brand__description">
              Our AI-powered tool combats fake news in Nepal by analyzing
              Nepali-language articles and classifying them as credible or fake.
              Integrated as a browser extension, it provides real-time feedback,
              promoting digital literacy and raising awareness about
              misinformation.
            </p>

            <div className="buttons">
              <button className="blob-btn" onClick={openPopup}>
                Try Our AI
              </button>
              <button
                className="blob-btn-download"
                onClick={() => {
                  window.location.href = "/accounts/login";
                }}
              >
                Download Browser Extension
              </button>
            </div>
          </div>
        </section>

        {/* Wrapper for background */}
        <div className="wrapper-top">
          {/* Stats Section */}

          <section className="stats padding">
            <div className="video-container">
              <iframe
                className="video-iframe"
                src="https://www.youtube.com/embed/"
                title="Rick Roll"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="stats__container">
              <div className="stats__container__item">
                <h2 className="stats__container__item__counter">
                  <Ticker end={100} duration={1} suffix=" +" />
                </h2>
                <p className="stats__container__item__description">
                  Unique Visitors
                </p>
              </div>
              <div className="stats__container__border"></div>
              <div className="stats__container__item">
                <h2 className="stats__container__item__counter">
                  <Ticker end={100} duration={1} suffix=" +" />
                </h2>
                <p className="stats__container__item__description">
                  Daily Users
                </p>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="services padding">
            <h2 className="services__heading">OUR FEATURES</h2>
            <div className="services__container">
              <div className="services__container__item card-hover">
                <div className="services__container__item__illustration">
                  <img
                    src={window.getStatic("lang.png")}
                    alt=""
                    className="services__container__item__illustration__image"
                  />
                </div>
                <div className="services__container__item__description">
                  <h3 className="services__container__item__description__heading">
                    Bilingual Support
                  </h3>
                  <p className="services__container__item__description__details">
                    Seamlessly works with Nepali and English news sources for
                    broader reach.
                  </p>
                </div>
              </div>
              <div className="services__container__item card-hover">
                <div className="services__container__item__illustration">
                  <img
                    src={window.getStatic("cross.png")}
                    alt=""
                    className="services__container__item__illustration__image"
                  />
                </div>
                <div className="services__container__item__description">
                  <h3 className="services__container__item__description__heading">
                    Cross-Platform Compatibility
                  </h3>
                  <p className="services__container__item__description__details">
                    Works seamlessly on different devices and browsers for
                    maximum accessibility.
                  </p>
                </div>
              </div>
              <div className="services__container__item card-hover">
                <div className="services__container__item__illustration">
                  <img
                    src={window.getStatic("3.png")}
                    alt=""
                    className="services__container__item__illustration__image"
                  />
                </div>
                <div className="services__container__item__description">
                  <h3 className="services__container__item__description__heading">
                    Source Credibility Insights
                  </h3>
                  <p className="services__container__item__description__details">
                    Provides additional context about the reliability of the
                    news source.
                  </p>
                </div>
              </div>
              <div className="services__container__item card-hover">
                <div className="services__container__item__illustration">
                  <img
                    src={window.getStatic("4.png")}
                    alt=""
                    className="services__container__item__illustration__image"
                  />
                </div>
                <div className="services__container__item__description">
                  <h3 className="services__container__item__description__heading">
                    User Feedback Integration
                  </h3>
                  <p className="services__container__item__description__details">
                    Allows users to flag inaccuracies and contribute to
                    improving the detection model.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Features Section */}
        <section className="features padding">
          <h2 className="features__heading">OUR TEAM MEMBERS</h2>
          <div className="features__container">
            <div className="features__container__item card-hover">
              <img
                src={window.getStatic("plan.png")}
                alt=""
                className="features__container__item__icon"
              />
              <h3 className="features__container__item__heading">
                Plan Ghimire
              </h3>
              <p className="features__container__item__details">
                Contributed to frontend development and web scraping,
                implementing dynamic user interfaces and gathering datasets for
                the AI/ML model, while ensuring integration with the backend for
                smooth functionality.
              </p>
              <div className="features__container__item__social-buttons">
                <a
                  href="https://www.linkedin.com/in/plan-ghimire/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                >
                  <img
                    src={window.getStatic("LinkedIn_logo.png")}
                    alt="LinkedIn"
                    className="social-icon"
                  />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/GhimirePlan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button github"
                >
                  <img
                    src={window.getStatic("Github_logo.png")}
                    alt="GitHub"
                    className="social-icon"
                  />
                  GitHub
                </a>
              </div>
            </div>

            <div className="features__container__item card-hover">
              <img
                src={window.getStatic("pranjal.jpg")}
                alt=""
                className="features__container__item__icon"
              />
              <h3 className="features__container__item__heading">
                Pranjal Shrestha
              </h3>
              <p className="features__container__item__details">
                Designed and trained AI/ML models to accurately detect fake
                news, focusing on Nepali language content and real-time
                classification.
              </p>
              <div className="features__container__item__social-buttons">
                <a
                  href="https://www.linkedin.com/in/pranjal-shrestha/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                >
                  <img
                    src={window.getStatic("LinkedIn_logo.png")}
                    alt="LinkedIn"
                    className="social-icon"
                  />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Pranj39"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button github"
                >
                  <img
                    src={window.getStatic("Github_logo.png")}
                    alt="GitHub"
                    className="social-icon"
                  />
                  GitHub
                </a>
              </div>
            </div>
            <div className="features__container__item card-hover">
              <img
                src={window.getStatic("nabin.jpg")}
                alt=""
                className="features__container__item__icon"
              />
              <h3 className="features__container__item__heading">
                Nabin Pokharel
              </h3>
              <p className="features__container__item__details">
                Developed the backend to seamlessly connect the AI/ML model with
                the frontend, enabling efficient data flow and real-time news
                classification.
              </p>
              <div className="features__container__item__social-buttons">
                <a
                  href="https://www.linkedin.com/in/nabin-pokheral/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                >
                  <img
                    src={window.getStatic("LinkedIn_logo.png")}
                    alt="LinkedIn"
                    className="social-icon"
                  />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Kalika37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button github"
                >
                  <img
                    src={window.getStatic("Github_logo.png")}
                    alt="GitHub"
                    className="social-icon"
                  />
                  GitHub
                </a>
              </div>
            </div>
            <div className="features__container__item card-hover">
              <img
                src={window.getStatic("shristi.jpg")}
                alt=""
                className="features__container__item__icon"
              />
              <h3 className="features__container__item__heading">
                Shristi Mallik
              </h3>
              <p className="features__container__item__details">
                I was responsible for collecting and managing data from
                different sources, ensuring its accuracy, organization, and
                usability. I collaborated with the team to meet data
                requirements, integrated the data into workflows, and documented
                processes to ensure transparency and reliability.
              </p>
              <div className="features__container__item__social-buttons">
                <a
                  href="https://www.linkedin.com/in/shristimallik/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button linkedin"
                >
                  <img
                    src={window.getStatic("LinkedIn_logo.png")}
                    alt="LinkedIn"
                    className="social-icon"
                  />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/shmallik111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button github"
                >
                  <img
                    src={window.getStatic("Github_logo.png")}
                    alt="GitHub"
                    className="social-icon"
                  />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* Reviews Section */}
        <section
          className="reviews padding"
          style={{
            backgroundImage: `url(${window.getStatic("assets/bgfooter.svg")})`,
          }}
        >
          <h2 className="reviews__heading">OUR REVIEWS</h2>

          <div className="reviews__carousel">
            <img
              src={window.getStatic("btn-prev.png")}
              alt="btn-prev"
              className="prev"
            />
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              slidesPerGroup={1}
              loop={true}
              loopFillGroupWithBlank={true}
              navigation={{
                nextEl: ".next",
                prevEl: ".prev",
              }}
              modules={[Navigation]}
              className="mySwiper"
              breakpoints={{
                // when window width is >= 768px
                768: {
                  slidesPerView: 2,
                },
              }}
            >
              {reviews.map((review, index) => (
                <SwiperSlide>
                  <div className="reviews__carousel__item">
                    <div className="reviews__carousel__item__stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        if (star <= review.reviews) {
                          return (
                            <img
                              src={window.getStatic("star.png")}
                              alt=""
                              className="reviews__carousel__item__stars__star"
                            />
                          );
                        } else {
                          return (
                            <img
                              src={window.getStatic("star_blur.png")}
                              alt=""
                              className="reviews__carousel__item__stars__star"
                            />
                          );
                        }
                      })}
                    </div>
                    <p className="reviews__carousel__item__details">
                      {review.message}
                    </p>
                    <h2 className="reviews__carousel__item__name">
                      {review.Username}
                    </h2>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <img
              src={window.getStatic("btn-next.png")}
              alt=""
              className="next"
            />
          </div>
        </section>
      </main>
      <PopUpUIFrame MainSettings={settingsprops} />
    </>
  );
}

function PopUpUIFrame({ MainSettings }) {
  const MainUIFrame = useRef(document.createElement("dialog"));
  const newsTextArea = useRef(document.createElement("div"));
  const feedbacktextarea = useRef(document.createElement("div"));
  const submitButton = useRef(document.createElement("div"));
  const closeBtn = useRef(document.createElement("div"));
  const predictionResult = useRef(document.createElement("div"));
  const feedbackBtn = useRef(document.createElement("div"));
  const toggleContainer = useRef(document.createElement("div"));
  const title = useRef(document.createElement("div"));
  const newsTextLabel = useRef(document.createElement("div"));
  const feedbackHeader = useRef(document.createElement("div"));
  const socialShareDiv = useRef(document.createElement("div"));
  const shareFacebookButton = useRef(document.createElement("div"));
  const CopyLink = useRef(document.createElement("div"));
  const shareTwitterButton = useRef(document.createElement("div"));
  const shareWhatsAppButton = useRef(document.createElement("div"));
  MainSettings.MainUIFrame = MainUIFrame;
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!MainUIFrame.current) return;

    closeBtn.current.onclick = () => {
      MainUIFrame.current.onclose();
      MainUIFrame.current.close();
    };
    let currentLanguage = "en";
    MainUIFrame.current.onclose = () => {
      MainUIFrame.current.style.height = "0px";
      MainUIFrame.current.firstElementChild.style.opacity = 0;
    };
    MainUIFrame.current.onopen = () => {
      MainUIFrame.current.style.height = "auto";
      MainUIFrame.current.firstElementChild.style.opacity = 1;
    };
    if (MainUIFrame.current.open) {
      MainUIFrame.current.onopen();
    } else {
      MainUIFrame.current.onclose();
    }
    MainUIFrame.showModal = () => {
      MainUIFrame.current.onopen();
      predictionResult.current.firstElementChild.style.display = "none";
      MainUIFrame.current.showModal();
    };

    // Fake news prediction function
    predictionResult.current.firstElementChild.style.display = "none";
    function predictNews(content) {
      predictionResult.current.firstElementChild.style.display = "block";
      predictionResult.current.style.display = "block";
      socialShareDiv.current.style.display = "none";
      predictionResult.current.lastElementChild.style.display = "none";

      const formdata = new FormData();
      formdata.append("content", content);
      const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]');
      if (csrfToken) {
        formdata.append("csrfmiddlewaretoken", csrfToken.value.trim());
      }

      fetch("/search_for_extension", {
        method: "POST",
        body: formdata,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((results) => {
          console.log(results);
          if (submitButton.current) submitButton.current.disabled = false;
          if (newsTextArea.current) newsTextArea.current.nextElementSibling.innerHTML = "";
          if (predictionResult.current) {
            predictionResult.current.firstElementChild.style.display = "none";
            predictionResult.current.lastElementChild.style.display = "block";
          }

          if (results.connection !== false) {
            predictionResult.current.lastElementChild.querySelector(".description").innerHTML = results.searchfor;
            predictionResult.current.lastElementChild.querySelector(".date").innerHTML = results.accuracy.toFixed(2) + "%";
            predictionResult.current.lastElementChild.querySelector(".source").innerHTML = results.authentic;
            predictionResult.current.lastElementChild.querySelector("h3").innerHTML = "";

            if (socialShareDiv.current) {
              socialShareDiv.current.style.display = "block";
              const feedbackForm = socialShareDiv.current.querySelector('.div');
              if (feedbackForm) feedbackForm.style.display = "block";
            }
          } else {
            socialShareDiv.current.style.display = "none";
            predictionResult.current.lastElementChild.querySelector("h3").style.color = "red";
            predictionResult.current.lastElementChild.querySelector(".description").innerHTML = results.news.description;
            predictionResult.current.lastElementChild.querySelector(".date").innerHTML = results.news.date;
            predictionResult.current.lastElementChild.querySelector(".source").innerHTML = "";
            predictionResult.current.lastElementChild.querySelector(".date").onclick = null;
            predictionResult.current.lastElementChild.querySelector("h3").innerHTML = results.news.title;
          }
        })
        .catch(err => {
          console.error("Prediction error:", err);
          if (submitButton.current) submitButton.current.disabled = false;
          if (predictionResult.current) {
            predictionResult.current.firstElementChild.style.display = "none";
            predictionResult.current.lastElementChild.style.display = "block";
            predictionResult.current.lastElementChild.querySelector("h3").style.color = "red";
            predictionResult.current.lastElementChild.querySelector("h3").innerHTML = "Error";
            predictionResult.current.lastElementChild.querySelector(".description").innerHTML =
              "Failed to get prediction. Please try again.";
            predictionResult.current.lastElementChild.querySelector(".date").innerHTML = "";
            predictionResult.current.lastElementChild.querySelector(".source").innerHTML = "";
          }
        });
    }

    // Update social share buttons
    function updateSocialShareButtons(message) {
      if (window.chrome && window.chrome.runtime) {
        shareFacebookButton.current.onclick = function () {
          window.chrome.runtime.sendMessage({
            command: "ShareResult",
            shareto: "facebook",
            searchfor: message,
          });
        };
        shareTwitterButton.current.onclick = function () {
          window.chrome.runtime.sendMessage({
            command: "ShareResult",
            shareto: "twitter",
            searchfor: message,
          });
        };
        shareWhatsAppButton.current.onclick = function () {
          window.chrome.runtime.sendMessage({
            command: "ShareResult",
            shareto: "whatsapp",
            searchfor: message,
          });
        };
        CopyLink.current.onclick = function () {
          window.chrome.runtime.sendMessage({
            command: "ShareResult",
            shareto: "copy",
            searchfor: message,
          });
        };
      }
    }

    // Update language
    function updateLanguage() {
      if (!title.current) return;
      title.current.textContent =
        currentLanguage === "en"
          ? "News Authenenticity Detector"
          : "समाचार प्रामाणिकता डिटेक्टर";
      newsTextLabel.current.textContent =
        currentLanguage === "en"
          ? "Enter the news text:"
          : "समाचारको पाठ प्रविष्ट गर्नुहोस्:";
      feedbackHeader.current.textContent =
        currentLanguage === "en"
          ? "Insert News' Text Here:"
          : "यहाँ समाचारको पाठ राख्नुहोस्:";
      feedbackBtn.current.textContent =
        currentLanguage === "en" ? "Send Feedback" : "प्रतिक्रिया पठाउनुहोस्";
      submitButton.current.textContent =
        currentLanguage === "en" ? "Predict" : "पूर्वानुमान गर्नुहोस्";
      newsTextArea.current.placeholder =
        currentLanguage === "en"
          ? "Paste or type news content here.."
          : "यहाँ समाचारको पाठ टाइप वा पेस्ट गर्नुहोस्...";

      if (newsTextArea.current.nextElementSibling.textContent.trim()) {
        newsTextArea.current.nextElementSibling.innerHTML =
          currentLanguage === "en"
            ? "Please enter some news content!"
            : "कृपया केही समाचार प्रविष्ट गर्नुहोस्!";
      }
      if (feedbacktextarea.current.nextElementSibling.textContent.trim()) {
        feedbacktextarea.current.nextElementSibling.innerHTML =
          currentLanguage === "en"
            ? "Please enter some content!"
            : "कृपया केही सामग्री प्रविष्ट गर्नुहोस्!";
      }
    }

    socialShareDiv.current.style.display = "none";

    // Predict news when submit button is clicked
    submitButton.current.onclick = function () {
      const newsContent = newsTextArea.current.value.trim();
      if (newsContent.length >= 5) {
        predictNews(newsContent);
        newsTextArea.current.value = "";
        submitButton.current.disabled = true;
      } else {
        predictionResult.current.style.display = "none";
        socialShareDiv.current.style.display = "none";
        newsTextArea.current.nextElementSibling.innerHTML =
          currentLanguage === "en"
            ? "Please enter some news content!(atleast 5 character)"
            : "कृपया केही समाचार प्रविष्ट गर्नुहोस्!";
      }
    }

    feedbackBtn.current.onclick = (e) => {
      e.preventDefault();
      const feedback = feedbacktextarea.current.value.trim();
      if (feedback.length >= 5) {
        feedbacktextarea.current.nextElementSibling.innerHTML = "";

        const formData = new FormData();
        formData.append("message", feedback);
        formData.append("review", rating);
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (csrfToken) {
          formData.append("csrfmiddlewaretoken", csrfToken.value.trim());
        }

        fetch("/send_feedback", {
          method: "POST",
          body: formData
        })
          .then(res => res.json())
          .then(data => {
            if (data.status) {
              alert("Thank you for your feedback!");
              feedbacktextarea.current.value = "";
              MainUIFrame.current.close();
            } else if (data.authentication) {
              if (confirm("You need to be logged in to submit feedback. Go to login page?")) {
                window.location.href = "/accounts/login";
              }
            } else {
              alert("Failed to submit feedback.");
            }
          })
          .catch(err => {
            console.error(err);
            alert("An error occurred.");
          });

      } else {
        feedbacktextarea.current.nextElementSibling.innerHTML =
          currentLanguage === "en"
            ? "Please enter some content!(atleast 5 character)"
            : "कृपया केही सामग्री प्रविष्ट गर्नुहोस्!";
      }
    };

    // Language toggle
    toggleContainer.current.onclick = () => {
      toggleContainer.current.classList.toggle("active");
      currentLanguage = currentLanguage === "en" ? "ne" : "en";
      updateLanguage();
    };

    // Initialize language
    updateLanguage();
  }, []); // Added dependency array to run once on mount

  return (
    <div className="text-content">
      <dialog ref={MainUIFrame} className="mainuiframe">
        <div id="mainResultUIFrame">
          <div className="container">
            <div className="close-button" ref={closeBtn}>
              X
            </div>
            <div>
              <h3 id=".current" ref={title}>
                News Authenenticity Detector
              </h3>
              <div id="language-switcher">
                <div
                  className="toggle-container"
                  ref={toggleContainer}
                  id="toggle-container"
                >
                  <div className="toggle-switch" id="toggle-switch"></div>
                  <span className="label left" id="en-label">
                    EN
                  </span>
                  <span className="label right" id="ne-label">
                    NE
                  </span>
                </div>
                <img
                  src={window.getStatic("assets/logo1.png")}
                  alt="Logo"
                  width="100px"
                  height="70px"
                  style={{ width: "100px" }}
                />
              </div>
            </div>

            <div className="content">
              <form id="news-form">
                <label
                  htmlFor="news-text"
                  ref={newsTextLabel}
                  id="news-text-label"
                >
                  Enter the news text:
                </label>
                <textarea
                  id="news-text"
                  ref={newsTextArea}
                  placeholder="Paste or type news content here..."
                ></textarea>
                <div className="error"></div>
                <button type="button" id="submit-button" ref={submitButton}>
                  Predict
                </button>
              </form>

              <p id="prediction-result" ref={predictionResult}>
                <div className="loadingicon">
                  <SpinnerCircular thickness={200} speed={100} />
                </div>
                <div className="content-component">
                  <h3> </h3>
                  <div className="description"></div>
                  <div className="date"></div>
                  <div className="source report"></div>
                </div>
              </p>
              <div
                id="social-share"
                ref={socialShareDiv}
                style={{
                  display: "none",
                }}
              >
                <div className="div" style={{ display: "none" }}>
                  <h2 id="feedback-header" ref={feedbackHeader}>
                    Insert News' Text Here:
                  </h2>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img
                        key={star}
                        src={star <= rating ? window.getStatic("star.png") : window.getStatic("star_blur.png")}
                        alt={`${star} stars`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <textarea
                    id="news-text-fedback"
                    placeholder="Enter Feedback..."
                    ref={feedbacktextarea}
                  ></textarea>
                  <div className="error"></div>
                  <div className="button-group">
                    <button id="feedback-btn" ref={feedbackBtn}>
                      Send Feedback
                    </button>
                  </div>
                </div>
                <h3>Share this result:</h3>
                <div className="share-buttons">
                  <button
                    className="share-button"
                    id="share-facebook"
                    ref={shareFacebookButton}
                  >
                    <img src="https://facebook.com/favicon.ico" alt="" />
                  </button>
                  <button
                    className="share-button"
                    id="share-twitter"
                    ref={shareTwitterButton}
                  >
                    <img src="https://x.com/favicon.ico" alt="" />
                  </button>
                  <button
                    className="share-button"
                    id="share-whatsapp"
                    ref={shareWhatsAppButton}
                  >
                    <img
                      src="https://cdn3.iconfinder.com/data/icons/social-media-chamfered-corner/154/whatsapp-512.png"
                      alt=""
                    />
                  </button>
                  <button
                    className="share-button"
                    id="share-link"
                    ref={CopyLink}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
import "./HomePage.scss";
import Ticker from "../../components/Ticker/Ticker";

export default HomePage;
