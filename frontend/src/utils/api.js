import axios from "axios";

// const API_BASE_URL = 'https://shine-backend-zo6m.onrender.com/api/whiteboards';
const API_BASE_URL =
	import.meta.env.MODE === "development"
		? "http://localhost:5170/api/whiteboards"
		: "/api/whiteboards";

import { io } from "socket.io-client";

// const SOCKET_URL = 'https://shine-backend-zo6m.onrender.com';
const SOCKET_URL =
	import.meta.env.MODE === "development" ? "http://localhost:5170" : "";
export const socket = io(SOCKET_URL);

export const saveWhiteboard = async (data) => {
	const response = await axios.post(`${API_BASE_URL}`, data);
	return response.data;
};

export const fetchWhiteboard = async (id) => {
	const response = await axios.get(`${API_BASE_URL}/${id}`);
	return response.data;
};

export const fetchAllWhiteboard = async () => {
	const response = await axios.get(`${API_BASE_URL}`);
	return response.data;
};

export const deleteWhiteboard = async (id) => {
	const response = await axios.delete(`${API_BASE_URL}/${id}`);
	return response.data;
};

export const updateWhiteboard = async (data) => {
	const response = await axios.put(`${API_BASE_URL}/${data.id}`, data);
	return response.data;
};
