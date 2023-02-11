#pragma once

#include <vector>
#include <winsock2.h>
#include <string>

class ITIROD_othread_Server
{

public:
	ITIROD_othread_Server(
		int buflen = 512,
		int port = 8888
	);

	bool startup();

public:

	struct Client
	{
		sockaddr_in m_socket;
		std::string Nickname;

		Client(sockaddr_in client_socket, std::string name)
			: Nickname(name), m_socket(client_socket) 
		{}
	};

	struct Message
	{
		std::string message;
		Client m_client;

		Message(Client client, std::string msg)
			: message(msg), m_client(client)
		{}

		std::string get_full_message();
		std::string get_personal_message();
	};

protected:

	SOCKET server_socket;
	sockaddr_in server;
	int BUFLEN;
	int server_port;

	int slen = sizeof(sockaddr_in);

	std::vector< Client > clients;
	std::vector<Message> messages;

protected:
	bool setup_server();

	bool send_message(std::string message, const Client& to);
	bool recieve_message(char*& message, sockaddr_in& client);

	bool handle_client_message(std::string message, sockaddr_in client_socket);

	void broadcast_last_message();
};

