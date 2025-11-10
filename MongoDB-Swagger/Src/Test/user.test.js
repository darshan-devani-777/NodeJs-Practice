const request = require('supertest');
const app = require('../../server'); 

describe('User API', () => {
    // CREATE USER
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123'
            });
    
        console.log('Create User Response:', res.body); 
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
    });
    

    // GET ALL USER
    it('should fetch all users', async () => {
        const res = await request(app)
            .get('/api/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // GET SPECIFIC USER
    it('should fetch user by ID', async () => {
        // First create a user
        const userRes = await request(app)
            .post('/api/users')
            .send({
                name: 'User to Fetch',
                email: 'fetchuser@example.com',
                password: 'password123'
            });
        
        const userId = userRes.body._id;

        // Now fetch that user
        const res = await request(app)
            .get(`/api/users/${userId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', userId);
    });

    // UPDATE USER
    it('should update a user', async () => {
        const userRes = await request(app)
            .post('/api/users')
            .send({
                name: 'User to Update',
                email: 'updateuser@example.com',
                password: 'password123'
            });

        const userId = userRes.body._id;

        const res = await request(app)
            .put(`/api/users/${userId}`)
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Updated Name');
    });

    // DELETE USER
    it('should delete a user', async () => {
        const userRes = await request(app)
            .post('/api/users')
            .send({
                name: 'User to Delete',
                email: 'deleteuser@example.com',
                password: 'password123'
            });

        const userId = userRes.body._id;

        const res = await request(app)
            .delete(`/api/users/${userId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('User deleted');
    });
});
