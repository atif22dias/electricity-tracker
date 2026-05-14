self.addEventListener("install", () => {
  console.log("Service Worker Installed");
});

self.addEventListener("fetch", () => {
  // basic offline support (optional simple cache later)
});