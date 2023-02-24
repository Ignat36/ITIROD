#include "ITIROD_mthread_Client.h"

#include <string>

#pragma comment(lib,"ws2_32.lib") 
#pragma warning(disable:4996) 

ITIROD_mthread_Client::ITIROD_mthread_Client(const char* ServerIp, int buflen, int port, std::string name) :
    server_ip_str(ServerIp), BUFLEN(buflen), server_port(port), client_name(name)
{
}

bool ITIROD_mthread_Client::connect()
{
    if (!setup_connection()) return false;
    if (!setup_name()) return false;

    redraw_console();
    main_thread();

    return true;
}

void ITIROD_mthread_Client::server_listener()
{
    char* message = new char[BUFLEN];
    while (true)
    {
        if (!recieve_message(message))
        {
            printf("Unable to recieve message ... ");
            continue;
        }

        std::string res = message;
        //std::this_thread::sleep_for(std::chrono::seconds(1));
        all_messages[last_msg++] = res;
    }
}

void ITIROD_mthread_Client::keyboard_listener()
{
    while (true)
    {
        char c = _getch();
        std::cout << c;
        if (c == 13)
        {
            keyboard_input_vector.push_back(keyboard_buffer);
            keyboard_buffer = "";
            //std::this_thread::sleep_for(std::chrono::seconds(1));
        }
        else
        {
            keyboard_buffer += c;
        }
    }
}

void ITIROD_mthread_Client::main_thread()
{
    std::thread keyboard_thread(&ITIROD_mthread_Client::keyboard_listener, this);
    std::thread server_thread(&ITIROD_mthread_Client::server_listener, this);
    
    while (true)
    {
        if (out_msg_count != keyboard_input_vector.size())
        {
            send_message(keyboard_input_vector[out_msg_count++].c_str());
        }

        if (in_msg_count != last_msg)
        {
            in_msg_count = last_msg;
            redraw_console();
        }
        
        //std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    closesocket(client_socket);
    WSACleanup();
}

bool ITIROD_mthread_Client::setup_connection()
{
    WSADATA ws;
    printf("Initialising Winsock...");
    if (WSAStartup(MAKEWORD(2, 2), &ws) != 0)
    {
        printf("Failed. Error Code: %d", WSAGetLastError());
        return false;
    }

    printf("Initialised.\n");

    if ((client_socket = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)) == SOCKET_ERROR) 
    {
        printf("socket() failed with error code: %d", WSAGetLastError());
        return false;
    }

    memset((char*)&server, 0, sizeof(server));
    server.sin_family = AF_INET;
    server.sin_port = htons(server_port);
    server.sin_addr.S_un.S_addr = inet_addr(server_ip_str);

    return true;
}

bool ITIROD_mthread_Client::setup_name()
{
    system("CLS");
    printf("Enter nickname for this session : ");

    char* message = new char[BUFLEN];
    std::cin.getline(message, BUFLEN);

    return send_message(message);
}

bool ITIROD_mthread_Client::send_message(const char* message)
{
    std::string mmessage = message;
    char* buffer = new char[BUFLEN];

    std::string char_count = std::to_string(mmessage.size());

    int i = 0;
    for (; i < BUFLEN && i < char_count.size(); i++) buffer[i] = char_count[i];
    if (i < BUFLEN) buffer[i++] = ' ';
    for (int j = 0; i < BUFLEN && j < mmessage.size(); j++, i++) buffer[i] = mmessage[j];
    for (; i < BUFLEN; i++) buffer[i] = ' ';

    if (sendto(
        client_socket,
        buffer,
        BUFLEN,
        0,
        (sockaddr*)&server,
        slen
    ) == SOCKET_ERROR)
    {
        printf("sendto() failed with error code: %d", WSAGetLastError());
        return false;
    }

    return true;
}

bool ITIROD_mthread_Client::recieve_message(char*& message)
{
    if (recvfrom(
        client_socket, 
        message, 
        BUFLEN, 
        0, 
        (sockaddr*)&server, 
        &slen
    ) == SOCKET_ERROR)
    {
        printf("recvfrom() failed with error code: %d", WSAGetLastError());
        return false;
    }

    std::string count = "";
    int i = 0;
    for (; i < BUFLEN && message[i] != ' '; i++) count += message[i];
    i++;

    int char_count = stoi(count);

    std::string n_message(char_count, ' ');
    for (int j = 0; j < char_count; j++, i++)
    {
        n_message[j] = message[i];
    }

    /*delete[] message;
    message = new char[char_count + 1];*/
    for (int j = 0; j < char_count; j++) message[j] = n_message[j];
    message[char_count] = '\0';

    return true;
}

void ITIROD_mthread_Client::redraw_console()
{
    system("CLS");
    int i = last_msg - messages_show_limit;
    if (i < 0) i = 0;
    for ( ; i < last_msg; i++ )
    {
        std::cout << all_messages[i] << "\n";
    }

    std::cout << "\n\nEnter message : " << keyboard_buffer;
}