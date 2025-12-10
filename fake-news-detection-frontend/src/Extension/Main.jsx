import React, { useEffect, useRef, useState } from 'react'
import { SpinnerCircular } from 'spinners-react';
import './styles.css'
export default function Main() {
    //reference to side buton for content js
    const MainUiButton = useRef(document.createElement("div"))
    //creating reference to the menuitems for side buttons
    const referenceMenuDialog = useRef(document.createElement('dialog'))
    //store for recently selected text in document to send in request to check 
    const recentSelectedText = useRef("")
    const MainSettings = {
        onreportAdd: (issue) => {
            if (window.chrome.runtime) {
                window.chrome.runtime.sendMessage({
                    url: window.location.href,
                    command: "ReportIssue",
                    message: issue
                }, (response) => {

                });
            }
        },
        onfeedbackAdd: (feedback) => {
            console.log(feedback)
            if (window.chrome.runtime) {
                window.chrome.runtime.sendMessage({
                    url: window.location.href,
                    command: "Feedback",
                    message: feedback
                }, (response) => {

                });
            }
        },
        onresultRequested: () => {
        },
        onresultResponse: () => {
        }
    }
    //don dom loaded
    useEffect(() => {
        const requestFakeNewsCheck = (content) => {
            MainSettings.onresultRequested()

            // 1. Send a message to the service worker requesting the news information
            if (window.chrome.runtime) {
                window.chrome.runtime.sendMessage({ url: window.location.href, command: 'CheckNewsForthis', clipboard: false, news: content }, (response) => {
                    MainSettings.onresultResponse(response)
                });
            }
        }
        MainUiButton.current.onclick = () => {
            const options = [
                'Check Selected',
                'Open Detector UI',
                'Send Feedback',
                'Report Issue'
            ]
            referenceMenuDialog.current.querySelector(".texter").innerHTML = ''
            for (let index = 0; index < options.length; index++) {
                let proceed = true
                if (index === 0) {
                    if (document.getSelection()) {
                        if (!document.getSelection().toString().trim()) {
                            proceed = false
                        } else {
                            recentSelectedText.current = document.getSelection().toString().trim()
                        }
                    } else {
                        proceed = false
                    }
                }
                if (proceed) {
                    const button = document.createElement("button")
                    button.innerHTML = options[index]
                    button.onclick = (e) => {
                        e.preventDefault()
                        if (index === 0) {
                            if (recentSelectedText.current) {
                                requestFakeNewsCheck(recentSelectedText.current)
                            }
                        }
                        if (index === 1) {
                            MainSettings.MainUIFrame.current.showModal()
                        }
                        if (index === 2) {
                            MainSettings.FeedBackFrame.current.showModal()
                        }
                        if (index === 3) {
                            MainSettings.ReportIssuesFrame.current.showModal()
                        }
                        referenceMenuDialog.current.close()
                    }
                    referenceMenuDialog.current.querySelector(".texter").appendChild(button)
                }

            }
            referenceMenuDialog.current.showModal()
            const rect = referenceMenuDialog.current.getBoundingClientRect()
            referenceMenuDialog.current.querySelector(".right").style.top = `${rect.height / 2 - 40}px`
            referenceMenuDialog.current.style.left = `calc(100vw - ${rect.width + 66}px)`
            referenceMenuDialog.current.style.top = `calc(100vh/2 - ${rect.height / 2 - 10}px)`
        }
        referenceMenuDialog.current.focus = -1
        //Handling the keydown event to manage context menu up and down
        referenceMenuDialog.current.onkeydown = (e) => {
            e.preventDefault()
            //handling menu down event
            if (e.key === "ArrowDown") {
                const buttons = referenceMenuDialog.current.querySelectorAll("button")
                if (referenceMenuDialog.current.focus === buttons.length - 1 || referenceMenuDialog.current.focus === -1) {
                    referenceMenuDialog.current.focus = 0
                    buttons[referenceMenuDialog.current.focus].focus();
                } else {
                    referenceMenuDialog.current.focus++;
                    buttons[referenceMenuDialog.current.focus].focus();
                }
            }
            //handling menu up event
            if (e.key === "ArrowUp") {
                const buttons = referenceMenuDialog.current.querySelectorAll("button")
                if (referenceMenuDialog.current.focus <= 0) {
                    referenceMenuDialog.current.focus = buttons.length - 1
                    buttons[referenceMenuDialog.current.focus].focus();
                } else {
                    referenceMenuDialog.current.focus--;
                    buttons[referenceMenuDialog.current.focus].focus();
                }
            }
            //clicking the focused button when enter clicked
            if (e.key === "Enter") {
                const buttons = referenceMenuDialog.current.querySelectorAll("button")
                try {
                    buttons[referenceMenuDialog.current.focus].click()
                } catch (error) {

                }
            }
            if (e.key === "Escape") {
                referenceMenuDialog.current.close()
            }
            return false
        }
        //close menu when clicked outside the box
        referenceMenuDialog.current.onclick = (e) => {
            const rect = referenceMenuDialog.current.getBoundingClientRect()
            if (e.x < rect.x || e.x > rect.x + rect.width + 5 || e.y < rect.y + 15 || e.y > rect.y + rect.height - 15) {
                referenceMenuDialog.current.close()
            }
        }
        const intervak = setInterval(() => {
            if (window.chrome.runtime) {
                window.chrome.runtime.onMessage.addListener(function (response, sendResponse) {
                    if (response.action === "Context_Menu_clicked") {
                        requestFakeNewsCheck(response.text)
                    }
                })
                clearInterval(intervak)
            }
        }, 1000);
        //on dom destroyed
        return () => {

        }
    })
    return (
        <>
            <div>
                <div className="inner" ref={MainUiButton}>
                    <img src="https://kalika37.github.io/ReactBounceBallAndTodo/content-icon.jpg" alt="" />
                </div >
                <dialog className='mainMenuFrame menu' ref={referenceMenuDialog}>
                    <div className="texter">
                        <button>Check Selected</button>
                        <button>Open Detector UI</button>
                        <button>Setting</button>
                        <button>Send Feedback</button>
                        <button>Report Issue</button>
                    </div>
                    <div className="right">
                    </div>
                </dialog>
            </div>
            <ResultFrame MainSettings={MainSettings} />
            <UIWindow MainSettings={MainSettings} />
            <ReportFrame MainSettings={MainSettings} />
            <FeedbackFrame MainSettings={MainSettings} />
        </>

    )
}
//component to show ui of extension
function UIWindow({ MainSettings }) {
    const MainUIFrame = useRef(document.createElement("dialog"))
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
    MainSettings.MainUIFrame = MainUIFrame
    const reviewsfield = useRef(document.createElement("fieldset"))
    const [review_error, setReviewError] = useState("")
    const [review, setReview] = useState(0)
    const reviewChanged = (value) => {
        MainUIFrame.current.onkeydown = (e) => {
            if (e.key === "Escape") {
                MainUIFrame.current.close()
            }
        }
        setReview(value)
        const reviews = reviewsfield.current.querySelectorAll("span.review")
        for (let index = 0; index < reviews.length; index++) {
            const review = reviews[index];
            if (index < value) {
                review.classList.add("active")
            } else {
                review.classList.remove("active")
            }

        }
    }
    useEffect(() => {
        MainUIFrame.current.onkeydown = (e) => {
            if (e.key === "Escape") {
                MainUIFrame.current.close()
            }
        }
        closeBtn.current.onclick = () => {
            MainUIFrame.current.close()
        }
        let currentLanguage = "en"
        MainUIFrame.showModal = () => {
            predictionResult.current.style.display = 'none';
            MainUIFrame.current.ShowModal()
        }
        // Fake news prediction function
        predictionResult.current.firstElementChild.style.display = "none"
        function predictNews(content) {
            if (window.chrome.runtime) {
                predictionResult.current.firstElementChild.style.display = "block"
                predictionResult.current.style.display = "block"
                socialShareDiv.current.style.display = 'none'
                predictionResult.current.lastElementChild.style.display = 'none'
                //sending to background js to make response to server
                window.chrome.runtime.sendMessage({ url: window.location.href, command: 'CheckNewsForthis', clipboard: true, news: content }, (results) => {
                    setTimeout(() => {
                        submitButton.current.disabled = false
                    }, 10);
                    newsTextArea.current.nextElementSibling.innerHTML = ''
                    predictionResult.current.firstElementChild.style.display = "none"
                    predictionResult.current.lastElementChild.style.display = 'block'
                    //dom render when result updated

                    if (results.connection !== false) {
                        socialShareDiv.current.style.display = 'block'
                        updateSocialShareButtons(content)
                        predictionResult.current.lastElementChild.querySelector("h3").style.color = 'black'
                        predictionResult.current.lastElementChild.querySelector(".description").innerHTML = results.searchfor
                        predictionResult.current.lastElementChild.querySelector(".date").innerHTML = results.accuracy ? results.accuracy.toFixed(2) + "%" : ""
                        predictionResult.current.lastElementChild.querySelector(".source").innerHTML = results.authentic
                        predictionResult.current.lastElementChild.querySelector(".date").classList.add("remove")
                        predictionResult.current.lastElementChild.querySelector(".date").onclick = null
                        predictionResult.current.lastElementChild.querySelector("h3").innerHTML = ""
                    } else {
                        predictionResult.current.lastElementChild.querySelector(".description").innerHTML = results.news.description
                        predictionResult.current.lastElementChild.querySelector(".date").innerHTML = results.news.date
                        predictionResult.current.lastElementChild.querySelector(".source").innerHTML = results.news.source.title
                        socialShareDiv.current.style.display = 'none'
                        predictionResult.current.lastElementChild.querySelector("h3").style.color = 'red'
                        predictionResult.current.lastElementChild.querySelector(".date").classList.add("remove")
                        predictionResult.current.lastElementChild.querySelector(".date").onclick = null
                        predictionResult.current.lastElementChild.querySelector("h3").innerHTML = results.news.title
                    }


                });
            }
        }
        // Update social share buttons
        function updateSocialShareButtons(message) {
            socialShareDiv.current.style.display = 'block'
            shareFacebookButton.current.onclick = function () {
                //sending to background js to make response to server and generating sharing link
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "facebook", searchfor: message })
            };
            shareTwitterButton.current.onclick = function () {
                //sending to background js to make response to server and generating sharing link
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "twitter", searchfor: message })

            };
            shareWhatsAppButton.current.onclick = function () {
                //sending to background js to make response to server and generating sharing link
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "whatsapp", searchfor: message })
            };
            CopyLink.current.onclick = function () {
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "Copy", searchfor: message }, (linkToCopy) => {
                    navigator.clipboard
                        .writeText(linkToCopy)
                        .then(() => {
                            alert("Copied To clipboard")
                        })
                        .catch((error) => {
                            console.error("Failed to copy the link:", error);
                        });
                })
            };
        }
        // Update language
        function updateLanguage() {
            title.current.textContent = currentLanguage === 'en' ? 'Fake News Detection' : 'झुटो समाचार पत्ता लगाउने';
            newsTextLabel.current.textContent = currentLanguage === 'en' ? 'Enter the news text:' : 'समाचारको पाठ प्रविष्ट गर्नुहोस्:';
            feedbackHeader.current.textContent = currentLanguage === 'en' ? 'Insert Feedback Message:' : 'यहाँ प्रतिक्रिया राख्नुहोस्:';
            feedbackBtn.current.textContent = currentLanguage === 'en'
                ? 'send Feedback'
                : 'प्रतिक्रिया पठाउनुहोस्';
            submitButton.current.textContent = currentLanguage === 'en' ? 'Predict' : 'पूर्वानुमान गर्नुहोस्';
            newsTextArea.current.placeholder =
                currentLanguage === 'en' ? 'Paste or type news content here...' : 'यहाँ समाचारको पाठ टाइप वा पेस्ट गर्नुहोस्...aaa';

            if (newsTextArea.current.nextElementSibling.textContent.trim()) {
                newsTextArea.current.nextElementSibling.innerHTML = currentLanguage === 'en'
                    ? 'Please enter some news content!'
                    : 'कृपया केही समाचार प्रविष्ट गर्नुहोस्!'
            }
            if (feedbacktextarea.current.nextElementSibling.textContent.trim()) {
                feedbacktextarea.current.nextElementSibling.innerHTML = currentLanguage === 'en'
                    ? 'Please enter some content!'
                    : 'कृपया केही सामग्री प्रविष्ट गर्नुहोस्!'
            }
        }
        // Predict news when submit button is clicked
        submitButton.current.onclick = function () {
            const newsContent = newsTextArea.current.value.trim();
            if (newsContent.length >= 5) {
                predictNews(newsContent);
                newsTextArea.current.value = ""
                submitButton.current.disabled = true

            } else {
                predictionResult.current.style.display = 'none';
                socialShareDiv.current.style.display = 'none';
                newsTextArea.current.nextElementSibling.innerHTML = currentLanguage === 'en'
                    ? 'Please enter some news content!(atleast 5 character)'
                    : 'कृपया केही समाचार प्रविष्ट गर्नुहोस्!'
            }
        }
        feedbackBtn.current.onclick = (e) => {
            e.preventDefault()
            const feedback = feedbacktextarea.current.value.trim();
            if (feedback.length >= 5) {
                if (review > 0) {
                    feedbacktextarea.current.nextElementSibling.innerHTML = ""
                    feedbacktextarea.current.value = ''
                    // ...
                    MainUIFrame.current.close()
                    MainSettings.onfeedbackAdd({ feedback, review })
                } else {
                    setReviewError("Reviews is required.")
                }

            } else {
                // predictionResult.current.style.display = 'none';
                // socialShareDiv.current.style.display = 'none';
                feedbacktextarea.current.nextElementSibling.innerHTML = currentLanguage === 'en'
                    ? 'Please enter some content!(atleast 5 character)'
                    : 'कृपया केही सामग्री प्रविष्ट गर्नुहोस्!'
            }
        }


        // Language toggle
        toggleContainer.current.onclick = () => {
            toggleContainer.current.classList.toggle('active');
            currentLanguage = currentLanguage === 'en' ? 'ne' : 'en';
            updateLanguage();
        }

        // Initialize language
        updateLanguage();
        return () => {

        }
    })
    return (
        <dialog ref={MainUIFrame} className='mainuiframe'>
            <div id='mainResultUIFrame'>
                <div className="close-button" ref={closeBtn}>X</div>
                <div className="container">
                    <header>
                        <h3 id=".current" ref={title}>Fake News Detection</h3>
                        <div id="language-switcher">
                            <div className="toggle-container" ref={toggleContainer} id="toggle-container">
                                <div className="toggle-switch" id="toggle-switch"></div>
                                <span className="label left" id="en-label">EN</span>
                                <span className="label right" id="ne-label">NE</span>
                            </div>
                            <img src="https://github.com/GhimirePlan/Team-Satya-AI-Powered-Fake-News-Detection-Tool-for-Nepali-Media/blob/main/favicon.png?raw=true" alt="Logo" width="100px" height="70px" style={{ width: '100px' }} />
                        </div>
                    </header>

                    <div className="content">
                        <form id="news-form">
                            <label htmlFor="news-text" ref={newsTextLabel} id="news-text-label">Enter the news text:</label>
                            <textarea id="news-text" ref={newsTextArea} placeholder="Paste or type news content here..."></textarea>
                            <div className="error" ></div>
                            <button type="button" id="submit-button" ref={submitButton}>Predict</button>
                        </form>

                        <div id="prediction-result" ref={predictionResult} style={{ display: "none" }}>
                            <div className="loadingicon">
                                <SpinnerCircular thickness={200} speed={300} />
                            </div>
                            <div className="content-component" style={{ display: "none" }} >
                                <h3> </h3>
                                <div className="description">
                                </div>
                                <div className="date">
                                </div>
                                <div className="source report">

                                </div>
                            </div>
                        </div>
                        <div id="social-share" ref={socialShareDiv} style={{
                            display: "none"
                        }}>
                            <p id="feedback-header" ref={feedbackHeader}>Insert Feedback Message:</p>
                            <textarea id="news-text-fedback" placeholder="Enter Feedback..." ref={feedbacktextarea} ></textarea>
                            <div className="error"></div>
                            <div ref={reviewsfield}>
                                <legend>Give Review</legend>
                                <span className="review" onClick={() => { reviewChanged(1) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                                    <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                                </svg></span>
                                <span className="review" onClick={() => { reviewChanged(2) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                                    <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                                </svg></span>
                                <span className="review" onClick={() => { reviewChanged(3) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                                    <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                                </svg></span>
                                <span className="review" onClick={() => { reviewChanged(4) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                                    <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                                </svg></span>
                                <span className="review" onClick={() => { reviewChanged(5) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                                    <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                                </svg></span>
                                <div className="highlight error">
                                    {review_error}
                                </div>
                            </div>
                            <div className="button-group">
                                <button id="feedback-btn" ref={feedbackBtn}>Send Feedback</button>
                            </div>
                            <h3>Share this result:</h3>
                            <div className="share-buttons">
                                <button className="share-button" id="share-facebook" ref={shareFacebookButton}>
                                    <img src="https://facebook.com/favicon.ico" alt="" />
                                </button>
                                <button className="share-button" id="share-twitter" ref={shareTwitterButton}>
                                    <img src="https://x.com/favicon.ico" alt="" />
                                </button>
                                <button className="share-button" id="share-link" ref={CopyLink}>
                                    <img src="https://cdn-icons-png.flaticon.com/512/10016/10016986.png" alt="" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </dialog>
    )
}
//component to show up the result of the 
function ResultFrame({ MainSettings }) {
    const mainResultUIFrame = useRef(document.createElement('dialog'))
    const loading = useRef(document.createElement('div'))
    const closeBtn = useRef(document.createElement('div'))
    const resultframe = useRef(document.createElement('div'))
    const sharebuttons = useRef(document.createElement('div'))
    MainSettings.mainResultUIFrame = mainResultUIFrame
    useEffect(() => {
        mainResultUIFrame.current.onkeydown = (e) => {
            if (e.key === "Escape") {
                mainResultUIFrame.current.close()
            }
        }
        closeBtn.current.onclick = () => {
            mainResultUIFrame.current.close()
        }
        resultframe.current.style.display = 'none'
        const shareFacebookButton = document.getElementById('share-facebook');
        const shareMore = document.getElementById('share-more');
        const shareTwitterButton = document.getElementById('share-twitter');
        function updateSocialShareButtons(message) {
            sharebuttons.current.style.display = 'block'
            shareFacebookButton.onclick = function () {
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "facebook", searchfor: message })
            };
            shareTwitterButton.onclick = function () {
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "twitter", searchfor: message })
            };

            shareMore.onclick = function () {
                window.chrome.runtime.sendMessage({ url: window.location.href, command: "ShareResult", shareto: "Copy", searchfor: message }, (linkToCopy) => {
                    navigator.clipboard
                        .writeText(linkToCopy)
                        .then(() => {
                            alert("Copied To clipboard")
                        })
                        .catch((error) => {
                            console.error("Failed to copy the link:", error);
                        });
                })
            };
        }
        MainSettings.onresultResponse = (results) => {
            if (!mainResultUIFrame.current.open) {
                mainResultUIFrame.current.showModal()
            }
            loading.current.style.display = "none"
            resultframe.current.style.display = 'block'
            if (results.connection !== false) {
                resultframe.current.querySelector(".description").innerHTML = results.searchfor
                resultframe.current.querySelector(".date").innerHTML = results.accuracy ? results.accuracy.toFixed(2) + "%" : ""
                resultframe.current.querySelector(".source").innerHTML = results.authentic
                resultframe.current.querySelector("h3").innerHTML = ''
                sharebuttons.current.style.display = 'block'
                updateSocialShareButtons(results.searchfor)
            } else {
                sharebuttons.current.style.display = 'none'
                resultframe.current.querySelector("h3").style.color = 'red'
                resultframe.current.querySelector(".description").innerHTML = results.news.description
                resultframe.current.querySelector(".date").innerHTML = results.news.date
                resultframe.current.querySelector(".source").innerHTML = results.news.source.title
                resultframe.current.querySelector(".date").classList.add("remove")
                resultframe.current.querySelector(".date").onclick = null
                resultframe.current.querySelector("h3").innerHTML = results.news.title
            }
        }
        MainSettings.onresultRequested = () => {
            resultframe.current.style.display = 'none'
            loading.current.style.display = 'block'
            if (!mainResultUIFrame.current.open) {
                mainResultUIFrame.current.showModal()
            }
        }
    })
    return <>
        <dialog className='result' ref={mainResultUIFrame}>
            <div className="close-button" ref={closeBtn}>X</div>
            <div className="inner">
                <div className="loadingicon" ref={loading}>
                    <SpinnerCircular thickness={200} speed={300} />
                </div>
                <div className="content-component" ref={resultframe}>
                    <h3></h3>
                    <div className="description">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis nisi eos aperiam veritatis vitae dolorum exercitationem corrupti praesentium ea, eligendi maxime alias minus dolorem dolore! Doloremque inventore voluptatem eius?
                    </div>
                    <div className="date">
                    </div>
                    <div className="source report">

                    </div>
                    <div id="social-share" style={{
                        display: "none"
                    }} ref={sharebuttons}>

                        <h3>Share this result:</h3>
                        <div className="share-buttons">
                            <button className="share-button" id="share-facebook">
                                <img src="https://facebook.com/favicon.ico" alt="" />
                            </button>
                            <button className="share-button" id="share-twitter">
                                <img src="https://x.com/favicon.ico" alt="" />
                            </button>
                            <button className="share-button" id="share-more">
                                <img src="https://cdn-icons-png.flaticon.com/512/10016/10016986.png" alt="" />
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    </>
}
//component to send report issues
function ReportFrame({ MainSettings }) {
    const ReportIssuesFrame = useRef(document.createElement("dialog"))
    const [issue, setIssue] = useState("")
    const [error, setError] = useState("")
    const onclickButton = () => {
        ReportIssuesFrame.current.onkeydown = (e) => {
            if (e.key === "Escape") {
                ReportIssuesFrame.current.close()
            }
        }
        if (issue.trim().length < 5) {
            setError("Issue message length must be greater then 5")
        } else {
            setError("")
            ReportIssuesFrame.current.close()
            MainSettings.onreportAdd(issue)


        }
    }
    useEffect(() => {
        ReportIssuesFrame.current.onclick = (e) => {
            const rect = ReportIssuesFrame.current.getBoundingClientRect()
            if (e.x < rect.x || e.x > rect.x + rect.width + 5 || e.y < rect.y + 15 || e.y > rect.y + rect.height - 15) {
                ReportIssuesFrame.current.close()
            }
        }
    })
    MainSettings.ReportIssuesFrame = ReportIssuesFrame
    return <>
        <dialog className='Response' ref={ReportIssuesFrame}>
            <div className="main">
                <h3>Report Issue - Fake News Detector</h3>
                <fieldset>
                    <legend>Issue Detail</legend>
                    <textarea name="feedback" placeholder='Enter Your Message...' id="issue" value={issue} onChange={(e) => { setIssue(e.target.value) }}></textarea>
                </fieldset>
                <div className="highlight error">
                    {error}
                </div>
                <button onClick={onclickButton}> Submit </button>
            </div>
        </dialog>
    </>
}
//component to send feedback of users
function FeedbackFrame({ MainSettings }) {
    const FeedBackFrame = useRef(document.createElement("dialog"))
    const [feedback, setFeedback] = useState("")
    const [error, setError] = useState("")
    const reviewsfield = useRef(document.createElement("fieldset"))
    const [review_error, setReviewError] = useState("")
    const [review, setReview] = useState(0)
    const reviewChanged = (e, value) => {
        e.preventDefault()
        setReview(value)
        const reviews = reviewsfield.current.querySelectorAll("span.review")
        for (let index = 0; index < reviews.length; index++) {
            const review = reviews[index];
            if (index < value) {
                review.classList.add("active")
            } else {
                review.classList.remove("active")
            }

        }
    }
    const onclickButton = () => {
        if (feedback.trim().length < 5) {
            setError("Feedback length must be greater then 5")
        } else {
            if (review > 0) {
                setError("")
                FeedBackFrame.current.close()
                MainSettings.onfeedbackAdd({ feedback, review })
            } else {
                setReviewError("Review is required..")
            }
        }
    }
    useEffect(() => {
        FeedBackFrame.current.onclick = (e) => {
            const rect = FeedBackFrame.current.getBoundingClientRect()
            if (e.x < rect.x || e.x > rect.x + rect.width + 5 || e.y < rect.y + 15 || e.y > rect.y + rect.height - 15) {
                FeedBackFrame.current.close()
            }
        }
    })
    MainSettings.FeedBackFrame = FeedBackFrame
    return <>
        <dialog className='Response' ref={FeedBackFrame}>
            <div className="main">
                <h3>Send Feedback - Fake News Detector</h3>
                <fieldset>
                    <legend>Feedback Detail</legend>
                    <textarea name="feedback" placeholder='Enter Your Message...' id="issue" value={feedback} onChange={(e) => { setFeedback(e.target.value) }}></textarea>
                    <div className="highlight error">
                        {error}
                    </div>
                </fieldset>
                <fieldset ref={reviewsfield}>
                    <legend>Give Review</legend>
                    <span className="review" onClick={(e) => { reviewChanged(e, 1) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                        <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                    </svg></span>
                    <span className="review" onClick={(e) => { reviewChanged(e, 2) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                        <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                    </svg></span>
                    <span className="review" onClick={(e) => { reviewChanged(e, 3) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                        <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                    </svg></span>
                    <span className="review" onClick={(e) => { reviewChanged(e, 4) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                        <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                    </svg></span>
                    <span className="review" onClick={(e) => { reviewChanged(e, 5) }}><svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" clipRule="evenodd" viewBox="0 0 500 500" id="star">
                        <path d="M250,25L305.112,148.906C307.229,153.665 310.562,157.782 314.776,160.844C318.99,163.906 323.936,165.803 329.116,166.346L463.988,180.471L363.177,271.175C359.305,274.659 356.419,279.101 354.809,284.055C353.2,289.008 352.923,294.299 354.008,299.393L382.252,432.029L264.835,364.181C260.325,361.575 255.209,360.203 250,360.203C244.791,360.203 239.675,361.575 235.165,364.181L117.748,432.029L145.992,299.393C147.077,294.299 146.8,289.008 145.191,284.055C143.581,279.101 140.695,274.659 136.823,271.175L36.012,180.471L170.884,166.346C176.064,165.803 181.01,163.906 185.224,160.844C189.438,157.782 192.771,153.665 194.888,148.906L250,25Z" transform="translate(-25.612 -2.561)scale(1.10245)"></path>
                    </svg></span>
                    <div className="highlight error">
                        {review_error}
                    </div>
                </fieldset>

                <button onClick={onclickButton}> Submit </button>
            </div>
        </dialog>
    </>
}