class RequestHandler {
    constructor(requestKey) {
        this.requestKey = requestKey;
        this.requestQueue = [];
        this.cache = {};
        this.maxRequestsPerSecond = 3;
    }
    
    async processRequest(url) {
        // Check 1: Ensure we're not exceeding the rate limit
        if (this.requestQueue.length >= this.maxRequestsPerSecond) {
            console.log('Too many requests. Please try again later.');
            return null;
        }
        
        // Check 2: Deduplicate the request
        const existingRequest = this.requestQueue.find((req) => req.key === this.requestKey);
        if (existingRequest) {
            existingRequest.timestamp = Date.now();
            console.log('Request already in queue. Updating timestamp.');
            } else {
            this.requestQueue.push({ key: this.requestKey, timestamp: Date.now() });
            console.log('New request added to the queue.');
        }
        
        // Check 3: Check if data is in the cache
        if (this.cache[this.requestKey] && this.cache[this.requestKey].expirationTime > Date.now()) {
            console.log('Data found in cache');
            return this.cache[this.requestKey].data;
        }
        
        try {
            // Check 4: Fetch data from the API
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch data from the API.');
            }
            
            const data = await response.json();
            
            // Store data in the cache
            this.cache[this.requestKey] = {
                data: data,
                expirationTime: Date.now() + 60000, // Cache data for 1 minute (adjust as needed)
            };
            
            console.log('Data fetched from the API');
            return data;
            } catch (error) {
            console.log('Error fetching data from the API:\n\n' + error.message);
            return null;
        }
    }
}

class RequestHandlerExt extends RequestHandler {
    constructor(requestKey, additionalCheck) {
        super(requestKey);
        this.additionalCheck = additionalCheck; // A funtion that will perform new checks
    }

    async processRequest(url) {
        // New check here
        if (!this.additionalCheck()) {
            console.log('Additional check failed. Request not sent.');
            return null;
        }

        // Call to the parent class's processRequest method
        return super.processRequest(url);
    }
}



// Example
isLoggedIn = true; //change for different response
const request = new RequestHandlerExt('users', () => {
   //Assuming we are checking if user is logged in
     if(isLoggedIn){
          return true; // Check successful
     }else{
          return false; // Check failed
     }
});

// Simulate Button press 5 times
for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        let url = 'https://jsonplaceholder.typicode.com/users';
        request.processRequest(url);
    }, i * 1000);
};