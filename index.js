var num = 0;

var app = new Vue({
  el: "#app",
  data() {
    return {
      messages: [],
      url: this.getConfig("mqtt.url", "ws://localhost:1884"),
      topic: this.getConfig("mqtt.topic", "my/test/topic"),
      client: null,
      error: null,
      content: ''
    };
  },
  methods: {
    connect() {
      if (this.client) {
        this.client.end();
      }
      try {
        this.client = mqtt.connect(this.url);
      } catch (err) {
        this.error = err;
      }
      this.client.stream.on("error", err => {
        this.error = err;
      });
      this.client.on("error", err => {
        this.error = err;
      });
      this.client.on("offline", err => {
        console.log("offline");
      });
      this.client.on("connect", () => {
        console.log("connected");
        this.setConfig("mqtt.url", this.url);
        this.setConfig("mqtt.topic", this.topic);
        this.client.subscribe(this.topic, function(err) {
          if (err) {
            this.error = err;
          }
        });
      });
      this.client.on("message", (topic, message) => {
        // message is Buffer
        console.log({ topic, message: message.toString(), num: num++ });
        app.$data.messages.push({ topic, content: message.toString() });
      });
    },
    getConfig(key, fallback) {
      if (!localStorage) {
        return fallback;
      }
      const val = localStorage.getItem(key) || fallback;
      localStorage.setItem(key, val);
      return val;
    },
    setConfig(key, val) {
      if (!localStorage) {
        return;
      }
      localStorage.setItem(key, val);
      return val;
    },
    publish() {
        this.client.publish(this.topic, this.content)
    }
  },
  computed: {
    connected() {
      return !!this.client && this.client.connected;
    }
  }
});
