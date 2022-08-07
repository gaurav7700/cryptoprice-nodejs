# Cryptoprice-nodejs

There are a total of two microservices in the project. Both the microservices are
deployed on serverless AWS, code is version controlled by git and github and
CICD implemented using Github Actions.

TEST API (GET) LINK: https://gxt1wiyi87.execute-api.us-east-1.amazonaws.com/test

Please try again if it shows - Internal Server Error

Microservice 1 -

Receive an email of the current price of a specific cryptocurrency.

GET API LINK: https://gxt1wiyi87.execute-api.us-east-1.amazonaws.com/getprice

Please send the ‘email’ and ‘cryptoname’ as json in the body of request and you
will receive an email with the result. If there is any error with the request, you will
receive an email stating the error.

Microservice 2 -

Retrieve all the search history using your email id. All the results will be emailed
to you.

GET API LINK: https://gxt1wiyi87.execute-api.us-east-1.amazonaws.com/gethistory

Please send the ‘email’ you previously used to search for the price of a
cryptocurrency. If there is any error or the email is never used, you will receive an
email stating the reason.
