FROM node:24.4-bookworm-slim

RUN apt update && apt install git -y
