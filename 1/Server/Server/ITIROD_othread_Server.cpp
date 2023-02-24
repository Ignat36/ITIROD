#include "ITIROD_othread_Server.h"

#pragma comment(lib,"ws2_32.lib") // Winsock Library
#pragma warning(disable:4996) 

ITIROD_othread_Server::ITIROD_othread_Server(int buflen, int port)
	: BUFLEN(buflen), server_port(port)
{
}

bool ITIROD_othread_Server::startup()
{
	if (!setup_server()) return false;

	while (true)
	{
		char* message = new char[BUFLEN];
		sockaddr_in client;

		if (recieve_message(message, client))
		{
			if (handle_client_message(message, client))
			{
				broadcast_last_message();
			}
		}
	}

	closesocket(server_socket);
	WSACleanup();
}

bool ITIROD_othread_Server::setup_server()
{
	// initialise winsock
	WSADATA wsa;
	printf("Initialising Winsock...");
	if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0)
	{
		printf("Failed. Error Code: %d", WSAGetLastError());
		return false;
	}
	printf("Initialised.\n");

	if ((server_socket = socket(AF_INET, SOCK_DGRAM, 0)) == INVALID_SOCKET)
	{
		printf("Could not create socket: %d", WSAGetLastError());
		return false;
	}
	printf("Socket created.\n");

	// prepare the sockaddr_in structure
	server.sin_family = AF_INET;
	server.sin_addr.s_addr = INADDR_ANY;
	server.sin_port = htons(server_port);

	// bind
	if (bind(server_socket, (sockaddr*)&server, sizeof(server)) == SOCKET_ERROR)
	{
		printf("Bind failed with error code: %d", WSAGetLastError());
		return false;
	}
	puts("Bind done.");

	return true;
}

bool ITIROD_othread_Server::send_message(std::string message, const Client& to)
{
	char* buffer = new char[BUFLEN];

	std::string char_count = std::to_string(message.size());

	int i = 0;
	for (; i < BUFLEN && i < char_count.size(); i++) buffer[i] = char_count[i];
	if (i < BUFLEN) buffer[i++] = ' ';
	for (int j = 0; i < BUFLEN && j < message.size(); j++, i++) buffer[i] = message[j];
	for (; i < BUFLEN; i++) buffer[i] = ' ';

	if (sendto(server_socket, buffer, BUFLEN, 0, (sockaddr*)&(to.m_socket), slen) == SOCKET_ERROR)
	{
	    printf("sendto() failed with error code: %d", WSAGetLastError());
	    return false;
	}

	return true;
}

bool ITIROD_othread_Server::recieve_message(char*& message, sockaddr_in& client)
{
	printf("Waiting for data...");
	fflush(stdout);

	// try to receive some data, this is a blocking call
	if (recvfrom(server_socket, message, BUFLEN, 0, (sockaddr*)&client, &slen) == SOCKET_ERROR)
	{
		printf("recvfrom() failed with error code: %d", WSAGetLastError());
		return false;
	}

	std::string count = "";
	int i = 0;
	for (; i < BUFLEN && message[i] != ' '; i++) count += message[i];
	i++;

	int char_count = stoi(count);

	std::string n_message = "";
	for (int j = 0; j < char_count; j++, i++)
	{
		n_message += message[i];
	}

	message = new char[char_count + 1];
	for (int j = 0; j < char_count; j++) message[j] = n_message[j];
	message[char_count] = '\0';

	// print details of the client/peer and the data received
	printf("Received packet from %s:%d\n", inet_ntoa(client.sin_addr), ntohs(client.sin_port));
	printf("Data: %s\n", message);

	return true;
}

bool ITIROD_othread_Server::handle_client_message(std::string message, sockaddr_in client_socket)
{
	for (auto& client : clients)
	{
		if (client.m_socket.sin_port == client_socket.sin_port)
		{
			messages.push_back(Message(client, message));
			return true;
		}
	}

	std::string name = "";
	for (int i = 0; i < BUFLEN; i++)
	{
		if (message[i] >= 32)
			name += message[i];
		else
			break;
	}

	clients.push_back(Client(client_socket, name));
	return false;
}

void ITIROD_othread_Server::broadcast_last_message()
{
	std::string msg = messages.back().get_full_message();
	for (auto& client : clients)
	{
		if (client.m_socket.sin_port == messages.back().m_client.m_socket.sin_port)
		{
			send_message(messages.back().get_personal_message(), client);
			continue;
		}

		send_message(msg, client);
	}
}

std::string ITIROD_othread_Server::Message::get_full_message()
{

	std::string res = "< " + std::string(m_client.Nickname) + " > " + message;
	return res;
}

std::string ITIROD_othread_Server::Message::get_personal_message()
{
	std::string res = "< ** Me ** > " + message;
	return res;
}
