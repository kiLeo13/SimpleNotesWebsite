export const handler = async (event) => {
  const backendUrl = process.env.BACKEND_URL;
  const connectionId = event.requestContext.connectionId;
  const token = (event.queryStringParameters || {}).token || "";
  const sessionId = (event.queryStringParameters || {}).session_id || "";

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "session_id is required",
      }),
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Connection-Id": connectionId,
    "X-Session-Id": sessionId,
    Authorization: token ? `Bearer ${token}` : "",
  };

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: headers,
    });

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      body: responseBody,
    };
  } catch (error) {
    console.error("Shim Error:", error);
    return {
      statusCode: 502,
      body: JSON.stringify({
        message: "Bad Gateway: Backend Unreachable",
      }),
    };
  }
};
