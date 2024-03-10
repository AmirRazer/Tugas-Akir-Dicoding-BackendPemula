// Impor Hapi dan library untuk menghasilkan ID unik
const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

// Buat instance server Hapi
const server = Hapi.server({
    port: 9000,
    host: 'localhost'
});

// Buat array untuk menyimpan buku
const books = [];

// Definisikan rute POST ke '/books'
server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
        // Baca data buku dari request payload
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        // Cek apakah properti name ada dalam payload
        if (!name) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. Mohon isi nama buku',
            }).code(400);
        }

        // Cek apakah readPage lebih besar dari pageCount
        if (readPage > pageCount) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
            }).code(400);
        }

        // Buat ID unik dan catat waktu saat ini
        const id = nanoid();
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        // Cek apakah buku telah selesai dibaca
        const finished = pageCount === readPage;

        // Buat objek buku
        const book = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };

        // Simpan buku ke array books
        books.push(book);

        // Kirim respons ke client
        return h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        }).code(201);
    }
});
// Definisikan rute GET ke '/books'
server.route({
    method: 'GET',
    path: '/books',
    handler: (request) => {
        const { name, reading, finished } = request.query;

        let filteredBooks = books;

        // Filter buku berdasarkan nama
        if (name) {
            filteredBooks = filteredBooks.filter((book) =>
                book.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        // Filter buku berdasarkan status membaca
        if (reading) {
            const isReading = reading === '1';
            filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
        }

        // Filter buku berdasarkan status selesai
        if (finished) {
            const isFinished = finished === '1';
            filteredBooks = filteredBooks.filter(book => book.finished === isFinished);
        }

        return {
            status: 'success',
            data: {
                books: filteredBooks.map(book => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        };
    },
});

// Fungsi untuk mencari buku berdasarkan id
function findBookById(bookId) {
    return books.find(book => book.id === bookId);
}

// Definisikan rute GET ke '/books/{bookId}'
server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
        const { bookId } = request.params;

        // Cari buku berdasarkan bookId dari database Anda di sini
        // Misalnya, kita asumsikan fungsi findBookById mengembalikan buku berdasarkan id
        const book = findBookById(bookId);

        // Jika buku tidak ditemukan, kembalikan pesan error
        if (!book) {
            return h.response({
                status: 'fail',
                message: 'Buku tidak ditemukan',
            }).code(404);
        }

        // Jika buku ditemukan, kembalikan buku tersebut
        return {
            status: 'success',
            data: {
                book,
            },
        };
    },
});
// Definisikan rute PUT ke '/books/{bookId}'
server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
        // Cari buku berdasarkan id
        const { bookId } = request.params;
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
        const updatedAt = new Date().toISOString();
        const index = books.findIndex((book) => book.id === bookId);

        // Jika buku tidak ditemukan, kirim respons error
        if (index === -1) {
            return h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Id tidak ditemukan',
            }).code(404);
        }

        // Cek apakah properti name ada dalam payload
        if (!name) {
            return h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Mohon isi nama buku',
            }).code(400);
        }

        // Cek apakah readPage lebih besar dari pageCount
        if (readPage > pageCount) {
            return h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            }).code(400);
        }

        // Perbarui data buku
        const finished = pageCount === readPage;
        books[index] = { ...books[index], name, year, author, summary, publisher, pageCount, readPage, finished, reading, updatedAt };

        // Kirim respons sukses
        return h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        }).code(200);
    }
});
// Definisikan rute DELETE ke '/books/{bookId}'
server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
        // Cari buku berdasarkan id
        const { bookId } = request.params;
        const index = books.findIndex((book) => book.id === bookId);

        // Jika buku tidak ditemukan, kirim respons error
        if (index === -1) {
            return h.response({
                status: 'fail',
                message: 'Buku gagal dihapus. Id tidak ditemukan',
            }).code(404);
        }

        // Hapus buku dari array
        books.splice(index, 1);

        // Kirim respons sukses
        return h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        }).code(200);
    }
});

// Fungsi untuk memulai server
const start = async () => {
    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running on %s', server.info.uri);
};

start();
