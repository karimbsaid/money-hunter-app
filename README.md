money hunter is e-learning business platform , the goal of this app is to allow people learn business , crypto investing online 
#RUN APP : 
nodemon server.js
#api
1-@GET ::: http://127.0.0.1:3000/api/v1/users/register  ---------> it accept name,email,password,confirmPassword,role(student is default) 
example of json body:
{   "name":"moahmed",
    "email" : "teacher1@gmail.com",
    "password" : "password123",
    "confirmPassword":"password123",
    "role":"teacher"
}


2-@POST ::: http://127.0.0.1:3000/api/v1/users/login    ------------->it accept email and password:
example of json body
{
    "email":"teacher@gmail.com",
    "password":"password123"
}

3-@POST ::: http://127.0.0.1:3000/api/v1/course      -> it accept title , description , price (this api need token in heaer Authorization )
example of json body:
{
  "title": "crypto full course bootcamp ",
  "description": "in this course we're going to dive into details about crypto , how can invest in crypto , etc...",
  "price": 100
}
4-@GET  http://127.0.0.1:3000/api/v1/course/<ID>  --------> get information about specefic course using it's ID 

5-@GET  http://127.0.0.1:3000/api/v1/course   -----> get all course 

6-@POST  http://127.0.0.1:3000/api/v1/course/<COURSE_ID >/sections   -> create new section to an existe course (COURSE_ID) || it accept only the name of the new section
example of json body:
{
    "name" : "Section 1 : welcome Section"
}

7-@POST http://127.0.0.1:3000/api/v1/course/<COURSE_ID>/sections/<SECTION_ID>/videos/ ---> upload video to specefic section et course it accept form-data (video and title )
8-@DELETE http://127.0.0.1:3000/api/v1/course/<COURSE_ID>/sections/<SECTION_ID>/videos/<VIDEO_ID> -->> delete specefic video
9 - @PATCH http://127.0.0.1:3000/api/v1/course/<COURSE_ID>/sections/<SECTION_ID>   ------------> edit the nam of setion
10- @Delete http://127.0.0.1:3000/api/v1/course/<COURSE_ID>/sections/<SECTION_ID>   ------------> delete Section
