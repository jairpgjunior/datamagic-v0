import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import CircularProgress from '@mui/material/CircularProgress';
import ChartImage1 from '../public/chart1.png';
import ChartImage2 from '../public/chart2.png';
import ChartImage3 from '../public/chart3.png';
import ChartImage4 from '../public/chart4.png';

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! I'm an AI-powered platform designed to simplify the management and optimization of digital advertising campaigns. Start asking me something like:\n Tell me about the weekly state of the campaigns for client SAS in Meta platform" }
 ]);
  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  const handleError = () => {
    setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: "To get started, add the environment variable `OPENAI_API_KEY` as a Secret. Make an account on [OpenAI](https://platform.openai.com/docs/api-reference) to get an API key." }]);
    setLoading(false);
    setUserInput("");
  }

  const handleReply = (reply, image) => {
    setLoading(true);
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: reply }]);
      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: image }]);
      setLoading(false);
      setUserInput("");
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (userInput.trim() === "") {
      return;
    }

    const context = [...messages, { role: "user", content: userInput }];
    setMessages(context);

    const scenarios = {
      "Tell me about the weekly state of the campaigns for client SAS in Meta platform": { 
        reply: `<p>Here's an overview of the current campaign status for client SAS in the Meta platform:</p>
                <ul>
                  <li>Metrics include click-through rates, conversion rates, and overall spend, compared with last week.</li>
                  <li>Interestingly, the allocated budget wasn't fully utilized; approximately 20% remained unspent, which could potentially impact the final results.</li>
                </ul>
                 <p>Other prompts you can use:</p>
                 <ul>
                    <li>Why are the campaigns not performing well compared to last week?</li>
                    <li>Plot and compare the conversion costs for the two main audiences at different times</li>
                    <li>Can you provide insights on how we can improve campaign performance?</li></ul>`,
        image: <Image src={ChartImage1} alt="chart1" width={837} height={300} /> 
      },
      "Why are the campaigns not performing well compared to last week?": { 
        reply: `<p>It appears there has been a decline in performance, particularly noticeable during specific times of the day and with certain audience segments. Through analysis, I've identified some factors to understand performance:</p>
                <ul>
                  <li>Fluctuations in user engagement at different times of the day, far behind others factors. </li>
                  <li>The median acquisition cost can vary significantly at different hours of the day. Refer to the in-depth breakdown for more information..</li>
                </ul>`,
        image: <Image src={ChartImage2} alt="chart2" width={837} height={300} />
      },
      "Plot and compare the conversion costs for the two main audiences at different times": { 
        reply: `<p>Upon analyzing the data, here are the insights:</p>
                <ul>
                  <li>Audience segment 1: From 1 am to 6 am, there's relatively low interest, with many clicks but fewer conversions.</li>
                  <li>Audience segment 2: From 11 am to 4 pm, the cost is high due to intense competition, leading to fewer conversions.</li>
                </ul>
                <p>Visualizing this data would provide a clear understanding of the variations in conversion costs across different times of the day.</p>`,
        image: <Image src={ChartImage3} alt="chart3" width={837} height={300} />
      },
      "Can you provide insights on how we can improve campaign performance?": { 
        reply: `<p>Certainly! Based on the analysis, my suggestion is to optimize bid strategies to align with variations in user activity throughout the day.</p>
                <p>For instance, running a prediction model based on past data suggests that by increasing maximum CPC spent during specific times of the day, we could potentially achieve 215 more conversions while spending 24% less per conversion in the next 10, utilizing the maximum budget allowed for the period.</p>
                <p>My confidence for this intervention is 72%.</p>`,
        image: <Image src={ChartImage4} alt="chart4" width={837} height={300} />
      }
    };
    

    const scenario = scenarios[userInput.trim()];
    if (scenario) {
      handleReply(scenario.reply, scenario.image);
      return;
    }

    // Send chat history to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: context }),
    });
  
    if (!response.ok) {
      handleError();
      return;
    }
  
    setUserInput("");
    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: data.result.content }]);
    setLoading(false);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      <Head>
        <title>datamagic Chat UI</title>
        <meta name="description" content="GPT-4 interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>
          <img className={styles.imglogo} src="exiber.svg" alt="Exiber Logo"></img>
        </div>
        <div className={styles.navlinks}>
          
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" && loading && index === messages.length - 1 ? styles.usermessagewaiting : message.role === "assistant" ? styles.apimessage : styles.usermessage}>
                {message.role === "assistant" ? <Image src="/openai.png" alt="AI" width="30" height="30" className={styles.boticon} priority={true} /> : <Image src="/usericon.png" alt="Me" width="30" height="30" className={styles.usericon} priority={true} />}
                <div className={styles.markdownanswer}>
                {typeof message.content === 'string' ? (
  <div dangerouslySetInnerHTML={{ __html: message.content }} />
) : (
  <div>{message.content}</div>
)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                type="text"
                id="userInput"
                name="userInput"
                placeholder={loading ? "Waiting for response..." : "Type your question..."}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? <div className={styles.loadingwheel}><CircularProgress color="inherit" size={20} /> </div> :
                  <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>}
              </button>
            </form>
          </div>
          <div className={styles.footer}>
            <p>Powered by <a href="https://openai.com/" target="_blank">datamagic</a>.</p>
          </div>
        </div>
      </main>
    </>
  )
}
