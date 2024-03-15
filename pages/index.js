import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import CircularProgress from '@mui/material/CircularProgress';
import ChartImage1 from '../public/chart1.jpeg';
import ChartImage2 from '../public/chart2.jpeg';
import ChartImage3 from '../public/chart3.jpeg';
import ChartImage4 from '../public/chart4.jpeg';

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! How can I help?" }
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
    setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: "To get started, fork this Repl and add the environment variable `OPENAI_API_KEY` as a Secret. Make an account on [OpenAI](https://platform.openai.com/docs/api-reference) to get an API key." }]);
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
      "text1": { reply: "reply1", image: <Image src={ChartImage1} alt="chart1" width={300} height={200} /> },
      "text2": { reply: "reply2", image: <Image src={ChartImage2} alt="chart2" width={300} height={200} /> },
      "text3": { reply: "reply3", image: <Image src={ChartImage3} alt="chart3" width={300} height={200} /> },
      "text4": { reply: "reply4", image: <Image src={ChartImage4} alt="chart4" width={300} height={200} /> }
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
        <title>GPT-4 Chat UI</title>
        <meta name="description" content="GPT-4 interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>
          <a href="/">GPT-4 Chat UI</a>
        </div>
        <div className={styles.navlinks}>
          <a href="https://platform.openai.com/docs/models/gpt-4" target="_blank">Docs</a>
          <a href="https://replit.com/@zahid/GPT-4-UI" target="_blank">Replit</a>
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" && loading && index === messages.length - 1 ? styles.usermessagewaiting : message.role === "assistant" ? styles.apimessage : styles.usermessage}>
                {message.role === "assistant" ? <Image src="/openai.png" alt="AI" width="30" height="30" className={styles.boticon} priority={true} /> : <Image src="/usericon.png" alt="Me" width="30" height="30" className={styles.usericon} priority={true} />}
                <div className={styles.markdownanswer}>
                  {typeof message.content === "string" ? (
                    <ReactMarkdown linkTarget="_blank">{message.content}</ReactMarkdown>
                  ) : (
                    <div>
                      {message.content}
                    </div>
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
            <p>Powered by <a href="https://openai.com/" target="_blank">OpenAI</a>. Built on <a href="https://replit.com/@zahid/GPT-4-UI" target="_blank">Replit</a>.</p>
          </div>
        </div>
      </main>
    </>
  )
}
