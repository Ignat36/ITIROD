#pragma once
#include <iostream>
#include <vector>
#include <conio.h>
#include <winsock2.h>
#include <thread>
#include <atomic>
#include <chrono>

class ITIROD_mthread_Client
{

public:
	ITIROD_mthread_Client(
		const char* ServerIp = "127.0.0.1",
		int buflen = 512,
		int port = 8888,
		std::string name = "Obeme");

	bool connect();

protected:

	const char* server_ip_str;
	int BUFLEN;
	int server_port;
	sockaddr_in server;
	SOCKET client_socket;
	int slen = sizeof(sockaddr_in);

	int messages_show_limit = 10;

	std::string client_name;

	std::vector<std::string> keyboard_input_vector; 
	int out_msg_count = 0;

	std::vector<std::string> all_messages;
	int in_msg_count = 0;

	std::string keyboard_buffer;

protected:
	void server_listener();
	void keyboard_listener();
	void main_thread();

	bool setup_connection();
	bool setup_name();

	bool send_message(const char* message);
	bool recieve_message(char*& message);

	void redraw_console();

private:

};

