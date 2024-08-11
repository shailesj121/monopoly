import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import './app.scss';

function CreateGamePage({ sendCodeToparent }) {
  const [randomNumber, setRandomNumber] = useState();
  const [noOfPlayerallowed, setNoOfPlayerallowed] = useState();
  const [isStarted, setIsStarted] = useState(false);
  const [joined, setJoined] = useState(0);

  const startGame = (event) => {
    event.preventDefault();
    const players = event.target[0].value;
    const code = Math.floor(Math.random() * 10000);
    sendCodeToparent(players, code);
    setNoOfPlayerallowed(players);
    setRandomNumber(code);
    setIsStarted(true);
  };

  if (isStarted)
    return (
      <>
        <h1>Number Of Players allowed: {noOfPlayerallowed}</h1>
        <h1>Your Code is: {randomNumber}</h1>
      </>
    );

  return (
    <>
      <form onSubmit={startGame}>
        <label htmlFor="players">Total Players: </label>
        <input id="players" type="number" />
        <button type="submit">Start</button>
      </form>
    </>
  );
}

function JoinGame({ sendcode }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState();

  const startGame = (event) => {
    event.preventDefault();
    sendcode(code, name);
  };

  return (
    <>
      <form onSubmit={startGame}>
        <label htmlFor="code">Enter Code: </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <label htmlFor="Name">your Name: </label>
        <input
          id="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>
    </>
  );
}

function App() {
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState("mainmenu");
  const [checkResult, setCheckResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const [name, setName] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [playerAllowed, setPlayerAllowed] = useState();
  const [playerJoined, setPlayerJoined] = useState(1);
  const [quickMessage, setquickMessage] = useState("")

  const socket = useMemo(() => io("http://localhost:3000/"), []);

  socket.on("connect", () => {
    console.log("Connected to server");
  });


  socket.on("message", (data) => {
    const { message, number } = data;
    if (playerJoined >= playerAllowed - 1) {
      setGameState("start");
    }
    setMessages(message);
    const totalPlayer = playerJoined + number;
    setPlayerJoined(totalPlayer);
  });

  () => {
    return () => {
      socket.off("connect");
      socket.off("userJoined");
      socket.off("roomUpdate");
      socket.off("joinSuccess");
      socket.off("error");
      socket.disconnect();
    };
  };

  const handleChildCreateGame = (noOfPlayer, code) => {
    console.log("Creating room with code:", code);
    const stringCode = String(code);
    setPlayerAllowed(noOfPlayer);
    socket.emit("createRoom", stringCode);
  };

  const handleJoinGame = (code, name) => {
    code ? setRoomCode(code) : null;
    name ? setName(name) : null;
    const stringCode = String(code);
    socket.emit("joinRoom", { stringCode, name});
  };

  const checkRoom = (roomCode) => {
    socket.emit("checkRoom", roomCode, (result) => {
      setCheckResult(result);
    });
  };

  const createGame = () => {
    setGameState("creategame");
  };

  const joinGame = () => {
    setGameState("joingame");
  };

  if (gameState === "mainmenu") {
    return (
      <>
        <button onClick={createGame}>Create</button>
        <button onClick={joinGame}>Join</button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            checkRoom(roomName);
          }}
        >
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room Code"
          />
          <button type="submit">Check Room</button>
        </form>
        {checkResult && (
          <div>
            <h3>Room Check Result:</h3>
            <p>Room Code: {checkResult.roomCode}</p>
            <p>Users: {checkResult.users.join(", ")}</p>
          </div>
        )}
        {notification && <div>{notification}</div>}
      </>
    );
  }

  if (gameState === "creategame") {
    return (
      <>
        <CreateGamePage sendCodeToparent={handleChildCreateGame} />
        <h5>No. of Player Joined: {playerJoined}</h5>
        {messages}
      </>
    );
  }

  if (gameState === "joingame") {
    return (
      <>
        <JoinGame sendcode={handleJoinGame} />
      </>
    );
  }

  if (gameState === "start") {
    return( <>
    <div className="table">
	<div className="board">
		<div className="center">
			<div className="community-chest-deck">
				<h2 className="label">Community Chest</h2>
				<div className="deck"></div>
			</div>
			{/* <h1 className="title">MONOPOLY</h1> */}
			<div className="chance-deck">
				<h2 className="label">Chance</h2>
				<div className="deck"></div>
			</div>
		</div>

		<div className="space corner go">
			<div className="container">
				<div className="instructions">Collect $200.00 salary as you pass</div>
				<div className="go-word">go</div>
			</div>
			<div className="arrow fa fa-long-arrow-left"></div>
		</div>

		<div className="row horizontal-row bottom-row">
			<div className="space property">
				<div className="container">
					<div className="color-bar light-blue"></div>
					<div className="name">Connecticut Avenue</div>
					<div className="price">PRICE $120</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar light-blue"></div>
					<div className="name">Vermont Avenue</div>
					<div className="price">Price $100</div>
				</div>
			</div>
			<div className="space chance">
				<div className="container">
					<div className="name">Chance</div>
					<i className="drawing fa fa-question"></i>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar light-blue"></div>
					<div className="name">Oriental Avenue</div>
					<div className="price">Price $100</div>
				</div>
			</div>
			<div className="space railroad">
				<div className="container">
					<div className="name">Reading Railroad</div>
					<i className="drawing fa fa-subway"></i>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space fee income-tax">
				<div className="container">
					<div className="name">Income Tax</div>
					<div className="diamond"></div>
					<div className="instructions">Pay 10% or $200</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar dark-purple"></div>
					<div className="name">Baltic Avenue</div>
					<div className="price">Price $50</div>
				</div>
			</div>
			<div className="space community-chest">
				<div className="container">
					<div className="name">Community Chest</div>
					<i className="drawing fa fa-cube"></i>
					<div className="instructions">Follow instructions on top card</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar dark-purple"></div>
					<div className="name three-line-name">Mediter- ranean Avenue</div>
					<div className="price">Price $50</div>
				</div>
			</div>
		</div>

		<div className="space corner jail">
			<div className="just">Just</div>
			<div className="drawing">
				<div className="container">
					<div className="name">In</div>
					<div className="window">
						<div className="bar"></div>
						<div className="bar"></div>
						<div className="bar"></div>
						<i className="person fa fa-frown-o"></i>
					</div>
					<div className="name">Jail</div>
				</div>
			</div>
			<div className="visiting">Visiting</div>
		</div>

		<div className="row vertical-row left-row">
			<div className="space property">
				<div className="container">
					<div className="color-bar orange"></div>
					<div className="name">New York Avenue</div>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar orange"></div>
					<div className="name">Tennessee Avenue</div>
					<div className="price">Price $180</div>
				</div>
			</div>
			<div className="space community-chest">
				<div className="container">
					<div className="name">Community Chest</div>
					<i className="drawing fa fa-cube"></i>
					<div className="instructions">Follow instructions on top card</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar orange"></div>
					<div className="name">St. James Avenue</div>
					<div className="price">Price $180</div>
				</div>
			</div>
			<div className="space railroad">
				<div className="container">
					<div className="name long-name">Pennsylvania Railroad</div>
					<i className="drawing fa fa-subway"></i>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar purple"></div>
					<div className="name">Virginia Avenue</div>
					<div className="price">Price $160</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar purple"></div>
					<div className="name">States Avenue</div>
					<div className="price">Price $140</div>
				</div>
			</div>
			<div className="space utility electric-company">
				<div className="container">
					<div className="name">Electric Company</div>
					<i className="drawing fa fa-lightbulb-o"></i>
					<div className="price">Price $150</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar purple"></div>
					<div className="name">St. Charles Place</div>
					<div className="price">Price $140</div>
				</div>
			</div>
		</div>

		<div className="space corner free-parking">
			<div className="container">
				<div className="name">Free</div>
				<i className="drawing fa fa-car"></i>
				<div className="name">Parking</div>
			</div>
		</div>

		<div className="row horizontal-row top-row">
			<div className="space property">
				<div className="container">
					<div className="color-bar red"></div>
					<div className="name">Kentucky Avenue</div>
					<div className="price">Price $220</div>
				</div>
			</div>
			<div className="space chance">
				<div className="container">
					<div className="name">Chance</div>
					<i className="drawing fa fa-question blue"></i>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar red"></div>
					<div className="name">Indiana Avenue</div>
					<div className="price">Price $220</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar red"></div>
					<div className="name">Illinois Avenue</div>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space railroad">
				<div className="container">
					<div className="name">B & O Railroad</div>
					<i className="drawing fa fa-subway"></i>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar yellow"></div>
					<div className="name">Atlantic Avenue</div>
					<div className="price">Price $260</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar yellow"></div>
					<div className="name">Ventnor Avenue</div>
					<div className="price">Price $260</div>
				</div>
			</div>
			<div className="space utility waterworks">
				<div className="container">
					<div className="name">Waterworks</div>
					<i className="drawing fa fa-tint"></i>
					<div className="price">Price $120</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar yellow"></div>
					<div className="name">Marvin Gardens</div>
					<div className="price">Price $280</div>
				</div>
			</div>
		</div>

		<div className="space corner go-to-jail">
			<div className="container">
				<div className="name">Go To</div>
				<i className="drawing fa fa-gavel"></i>
				<div className="name">Jail</div>
			</div>
		</div>

		<div className="row vertical-row right-row">
			<div className="space property">
				<div className="container">
					<div className="color-bar green"></div>
					<div className="name">Pacific Avenue</div>
					<div className="price">Price $300</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar green"></div>
					<div className="name three-line-name">North Carolina Avenue</div>
					<div className="price">Price $300</div>
				</div>
			</div>
			<div className="space community-chest">
				<div className="container">
					<div className="name">Community Chest</div>
					<i className="drawing fa fa-cube"></i>
					<div className="instructions">Follow instructions on top card</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar green"></div>
					<div className="name long-name">Pennsylvania Avenue</div>
					<div className="price">Price $320</div>
				</div>
			</div>
			<div className="space railroad">
				<div className="container">
					<div className="name">Short Line</div>
					<i className="drawing fa fa-subway"></i>
					<div className="price">Price $200</div>
				</div>
			</div>
			<div className="space chance">
				<div className="container">
					<div className="name">Chance</div>
					<i className="drawing fa fa-question"></i>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar dark-blue"></div>
					<div className="name">Park Place</div>
					<div className="price">Price $350</div>
				</div>
			</div>
			<div className="space fee luxury-tax">
				<div className="container">
					<div className="name">Luxury Tax</div>
					<div className="drawing fa fa-diamond"></div>
					<div className="instructions">Pay $75.00</div>
				</div>
			</div>
			<div className="space property">
				<div className="container">
					<div className="color-bar dark-blue"></div>
					<div className="name">Boardwalk</div>
					<div className="price">Price $400</div>
				</div>
			</div>
		</div>
	</div>
</div>
    </>)
  }

  return null;
}

export default App;