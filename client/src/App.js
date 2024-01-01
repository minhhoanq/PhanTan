import './App.css';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

function App() {
    const [join, setJoin] = useState(false)
    const [name, setName] = useState('')
    const [id, setId] = useState('')
    const socket = useRef()
    const [input, setInput] = useState();
    const [checkName, setCheckName] = useState(false);

    // const [message, setMessage] = useState([])

    useEffect(() => {
        socket.current = io('http://192.168.2.11:5000', {})
        // Xử lý sự kiện khi kết nối thành công
        socket.current.on('connect', () => {
            console.log('Connected to server');
        });
        socket.current.on('return_id_connect', (id) => {
            console.log('Your id is: ' + id);
            setId(id);
        });
        
        socket.current.on('return_login_fail', () => {
            alert("Username đã được sử dụng!");
            document.getElementById('login').style.visibility = "";
            document.getElementById('box').style.visibility = "hidden";
        });
       
        socket.current.on('server_return_error', data => {
            alert(data);
        })
        // Xử lý sự kiện khi ngắt kết nối
        socket.current.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        return () => socket.current.disconnect();
    }, [])

    useEffect(() => {
        // if (join) {
            // socket.current.on('server-message', (data) => {
            //     console.log('Received message from server:', data);
            // });

            socket.current.on('return_users', (data) => { 
                // setJoin(true)
                document.getElementById('login').style.visibility = "hidden";
                document.getElementById('box').style.visibility = "";
                console.log("users:", data)
                // console.log("join:", join)
                // if(join) {
                    let el = document.getElementById("currentUser");
                    el.innerHTML = `Hello ${data}`;  
                // } 
            });

            socket.current.on('server_send_list_users', (data) => {
                document.getElementById('login').style.visibilit = "hidden";
                document.getElementById('box').style.visibility = "";
                let el = document.getElementById('boxOnline');
                console.log(data)
                el.innerHTML = "";
                data.forEach(i => {
                    el.innerHTML += `<li class="users"> ${i}
                        <p></p>
                    </li>`
                });
            })

            // // máy khác join
            // socket.current.on('another-join', (data) => {
            //     console.log('Another join:', data);
            // });

            // // máy khác gửi số lên server
            // socket.current.on('message-from-another', (data) => {
            //     console.log('Message from another:', data);
            //     setMessage(old => [...old, data])
            // });

            // socket.current.on('server-sum', (data) => {
            //     setMessage(old => [...old, data])
            // });
            if(id) {
                socket.current.on('server_send_msg', (data) => {
                    let el = document.getElementById('userMsg');
                    console.log(data)
                    console.log(id)
                    // el.innerHTML += `<span class="${data.id === id ? "own" : "msg"}"> ${data.un + ": " + data.msg} </span>`;

                    el.innerHTML += `<div class="wrap_msg ${data.id === id ? "user" : ""}"/>
                        <img class="image" src="https://cdn-icons-png.flaticon.com/512/219/219988.png"
                        alt=""/>
                        <div class="wrap_msg_a">
                            <span>${data.un}</span>
                            <span class="${data.id === id ? "own" : "msg"}">
                                Tổng: ${data.msg} 
                            </span>
                        </div>
                    </div>`;
                })
                socket.current.on('server_send_sum', (data) => {
                    let el = document.getElementById('userMsg');
                    console.log(data)
                    el.innerHTML += `<div class="wrap_msg"/>
                        <img class="image" src="https://png.pngtree.com/png-vector/20220707/ourmid/pngtree-chatbot-robot-concept-chat-bot-png-image_5632381.png"
                        alt=""/>
                        <div class="wrap_msg_a">
                            <span>${data.sv}</span>
                            <span class='msg'>
                                Tổng: ${data.msg} 
                            </span>
                        </div>
                    </div>`;
                })
            }
        // }
    }, [id]);

    const onSubmitName = (e) => {
        if(name === "") {
            setCheckName(true);
        } else {
            setCheckName(false)
            socket.current.emit('login', name);
        }
    }

    const onChangeNumber = (e) => {
        let value = e.target.value;
        // if(value > 10) {
        //     value = 10;
        // }
        // if( value < 1) {
        //     value = 1
        // }
        setInput(value);
    }

    return (
        <div className="app">
           <div className='app_wrapper'>
            {/* {!join ? ( */}
                    <div className='app_wrapper_login' id='login'>
                        <span className='app_wrapper_login_text'>
                            Đăng nhập
                        </span>
                        <div>
                            <div className='app_wrapper_login_input'>
                                <i class="fa-solid fa-user"></i>
                                    <input
                                        className='app_wrapper_login_input-input' 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        placeholder='Tên của bạn...' 
                                    />
                            </div>
                            {checkName ? <span className='error-login'>Vui lòng nhập tên của bạn!</span> : <></>}
                        </div>
                        <button 
                            className='app_wrapper_login_button'
                            onClick={onSubmitName}
                        >
                            Xác nhận
                        </button>
                    </div>
                {/* ) : ( */}
                    <div className='app_wrapper_box' id='box' style={{
                        visibility: "hidden"
                    }}>
                        <div className='app_wrapper_box_status'>
                            <span className='app_wrapper_box_status_title'>
                                Users
                            </span>
                            <ul className='app_wrapper_box_status_list' id='boxOnline'>
                                    {/* <li className='app_wrapper_box_status_list_user' id='boxOnline'>
                                        
                                        <p></p>
                                    </li> */}
                            </ul>
                        </div>
                        <div className='app_wrapper_box_chat'>
                            <p className='app_wrapper_box_chat_title' id='currentUser'></p>
                            <div className='app_wrapper_box_chat_body'>
                                <div className='app_wrapper_box_chat_body_content' id='userMsg'>
                                    {/*Content*/}
                                </div>
                                <div className='app_wrapper_box_chat_body_action'>
                                    <input 
                                        className='app_wrapper_box_chat_body_action_input'
                                        type='text' 
                                        value={input}
                                        // min="1" max="10"
                                        onChange={onChangeNumber} 
                                        placeholder='Nhập số từ 1 - 10'
                                        />
                                    <button
                                        className='app_wrapper_box_chat_body_action_send'
                                        onClick={() => {
                                            socket.current.emit('user_send_msg', input);
                                        }}>
                                            <i class="fa-solid fa-paper-plane"></i>
                                        </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/* )} */}
           </div>

        </div>
    );
}

export default App;
