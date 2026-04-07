import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import jwt from 'jsonwebtoken';

async function testUpload() {
    try {
        const token = jwt.sign({ foo: 'bar', id: 'foo' }, process.env.JWT_SECRET || 'foo'); // we can just use whatever token might pass, but actually wait we need admin login token.
        console.log("Token for admin?");
    } catch(e) {
        console.error(e);
    }
}
testUpload();
