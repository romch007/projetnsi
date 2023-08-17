FROM python:3-alpine

LABEL org.opencontainers.image.source="https://github.com/romch007/projetnsi"

WORKDIR /app

RUN apk update && apk add --no-cache tini

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
RUN pip3 install waitress

COPY . .

RUN adduser -D nonroot
RUN mkdir /data
RUN chown -R nonroot:nonroot /data
USER nonroot

ENV STORAGE=/data/projetnsi.db

EXPOSE 8080

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ["waitress-serve", "--host", "0.0.0.0", "app:app"]
