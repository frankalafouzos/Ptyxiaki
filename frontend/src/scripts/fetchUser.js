export const fetchUser = async (email, setLoading, setUser) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("Fetching user data for email:", email);
  }
  setLoading(true);
  try {
    const response = await fetch(
      `http://localhost:5000/users/userprofile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      }
    );

    if (!response.ok) {
      throw new Error("User not found");
    }

    let data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log("Received user data:", data);
    }

    setUser(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

export const fetchOwner = async (email, setLoading, setOwner) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("Fetching owner data for email:", email);
  }
  setLoading(true);
  try {
    const response = await fetch(
      `http://localhost:5000/owners/ownerprofile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      }
    );

    if (!response.ok) {
      throw new Error("Owner not found");
    }

    let data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log("Received owner data:", data);
    }

    setOwner(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
