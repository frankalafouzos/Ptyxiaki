export const fetchUser = async (email, setLoading, setUser) => {
    console.log("Fetching user data for email:", email);
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
  
      let data = await response.json(); // Await the JSON conversion
      console.log("Received user data:", data);
  
      setUser(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };