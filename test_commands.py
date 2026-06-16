import unittest
from commands import add_Animal, get_Animals, db

class TestAnimalSearch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Очищаем базу от возможных предыдущих тестовых данных перед запуском всех тестов
        db.execute('DELETE FROM "public"."Animal" WHERE "Name" LIKE %s', ('Test_Animal_%',))

    def setUp(self):
        # Создаем уникальных тестовых животных для проверки фильтров
        add_Animal("Cat", "Siamese", "Test_Animal_1", "Fluffy", 3, 5000, True)
        add_Animal("Dog", "Bulldog", "Test_Animal_2", "Strong", 5, 10000, False)
        add_Animal("Cat", "Sphynx", "Test_Animal_3", "Bald", 3, 15000, False)

    def tearDown(self):
        # Очищаем тестовые данные после каждого теста
        db.execute('DELETE FROM "public"."Animal" WHERE "Name" LIKE %s', ('Test_Animal_%',))

    def test_get_all_animals(self):
        animals = get_Animals()
        # Должно быть как минимум 3 созданных животных
        self.assertGreaterEqual(len(animals), 3)

    def test_get_animals_by_type(self):
        cats = get_Animals(Type="Cat")
        dogs = get_Animals(Type="Dog")
        
        self.assertTrue(all(a["Type"] == "Cat" for a in cats))
        self.assertTrue(all(a["Type"] == "Dog" for a in dogs))
        
        # Проверяем, что наши тестовые коты нашлись
        cat_names = [a["Name"] for a in cats]
        self.assertIn("Test_Animal_1", cat_names)
        self.assertIn("Test_Animal_3", cat_names)

    def test_get_animals_by_breed(self):
        bulldogs = get_Animals(Breed="Bulldog")
        self.assertTrue(all(a["Breed"] == "Bulldog" for a in bulldogs))
        
        names = [a["Name"] for a in bulldogs]
        self.assertIn("Test_Animal_2", names)

    def test_get_animals_by_age(self):
        age_3_animals = get_Animals(Age=3)
        self.assertTrue(all(a["OrientatedAge"] == 3 for a in age_3_animals))
        
        names = [a["Name"] for a in age_3_animals]
        self.assertIn("Test_Animal_1", names)
        self.assertIn("Test_Animal_3", names)

    def test_get_animals_by_sterealized(self):
        sterealized_animals = get_Animals(Sterealized=True)
        self.assertTrue(all(a["Sterealized"] is True for a in sterealized_animals))
        
        names = [a["Name"] for a in sterealized_animals]
        self.assertIn("Test_Animal_1", names)

    def test_get_animals_multiple_params(self):
        # Ищем кота, которому 3 года, и он не стерилизован (Test_Animal_3)
        results = get_Animals(Type="Cat", Age=3, Sterealized=False)
        self.assertTrue(len(results) >= 1)
        
        for a in results:
            self.assertEqual(a["Type"], "Cat")
            self.assertEqual(a["OrientatedAge"], 3)
            self.assertEqual(a["Sterealized"], False)
            
        names = [a["Name"] for a in results]
        self.assertIn("Test_Animal_3", names)

    def test_get_animals_no_match(self):
        results = get_Animals(Type="Dragon", Breed="Firebreather")
        self.assertEqual(len(results), 0)

if __name__ == "__main__":
    unittest.main()
