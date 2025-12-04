import "./App.css";
import React from "react";
import Navbar from "./components/Navbar/Navbar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useState } from "react";

//Pages
import HomePage from "./Pages/HomePage/HomePage";
import TermsAndService from "./Pages/TermsAndService/TermsAndService";
import SearchResult from "./Pages/SearchResult/search_result";
import Login from "./Pages/Login/login";
import Register from "./Pages/Register/register";
import Footer from "./components/Footer/Footer";
window.LoginError = "authentication failed"
window.RegistrationErrors = {
	email: "email already exists",
	username: "username already exists",
	password_connf: "passwords do not match",
	password: "too weak password",
	first_name: "first name cannot be empty",
	last_name: "last name cannot be empty"
}
if (!window.getStatic) {
	window.getStatic = (path) => { return "" + path }
}
window.news = [
	{ category: "Politics", text: "Election results announced.", result: "Authentic", link: "https://www.example.com" },
];
function App() {
	const [loading, setLoading] = useState(true);
	const spinner = document.getElementById("loader");
	if (spinner) {
		setTimeout(() => {
			spinner.style.display = "none";
			setLoading(false)
		}, 700);
	}
	return (
		!loading && (
			<>
				<div className="App">
					<Navbar />
					<Switch>
						<Route exact end path="/">
							<HomePage />
						</Route>
						<Route exact path="/tos">
							<TermsAndService />
						</Route>
						<Route exact path="/search_result">
							<SearchResult newsData={window.news} />
						</Route>
						<Route exact path="/accounts/login">
							<Login />
						</Route>
						<Route exact path="/accounts/register">
							<Register />
						</Route>
					</Switch>
					<Footer />
				</div>
			</>
		)
	);
}

export default App;
