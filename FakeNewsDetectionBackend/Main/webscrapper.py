import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager 
from bs4 import BeautifulSoup, Tag
from typing import List
import difflib

def matchNews(a, b):
    seq = difflib.SequenceMatcher()
    seq.set_seqs(a.lower(), b.lower())
    d = seq.ratio()
    return d

class Data:
    title: str 
    description: str 
    source: str

MAx_LIMIT_TODAY_DATA = 30

class Kantipur:
    lists: List[Data] = []
    def __init__(self, url="https://ekantipur.com/news"):
        # Set up Chrome options
        options = Options()
        options.add_argument("--headless")
        
        # --- FIX: Use webdriver-manager automatically ---
        service = Service(ChromeDriverManager().install())
        
        try:
            # Initialize the WebDriver
            driver = webdriver.Chrome(service=service, options=options)

            # Open the webpage
            driver.get(url)
            time.sleep(3)  # Wait for the page to load

            # Scroll to load more content until we reach limit
            last_height = driver.execute_script("return document.body.scrollHeight")
            extracted_data = 0
            max_data = MAx_LIMIT_TODAY_DATA
            while extracted_data < max_data:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)

                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    print("No more content to load, stopping scroll.")
                    break
                last_height = new_height

                soup = BeautifulSoup(driver.page_source, 'html.parser')
                h2_tags = soup.find_all('h2')
                p_tags = soup.find_all('p')

                h2: Tag
                p: Tag 
                for h2, p in zip(h2_tags, p_tags):
                    if extracted_data >= max_data:
                        break
                    heading = h2.get_text(strip=True)
                    try:
                        link = url + h2.find("a")['href']
                    except:
                        link = url
                    subheading = p.get_text(strip=True)
                    data = Data()
                    data.title = heading 
                    data.description = subheading
                    data.source = link 
                    self.lists.append(data)
                    extracted_data += 1
        except Exception as e:
            print(f"An error occurred: {e}")

        finally:
            try:
                driver.quit()
            except NameError:
                print("Driver was not initialized, skipping driver.quit()")

    def gettodaynews(self):
        return self.lists

class Annapurna:
    lists: List[Data] = []
    def __init__(self, url="https://www.annapurnapost.com/"):
        # Set up Chrome options
        options = Options()
        options.add_argument("--headless")

        # --- FIX: Use webdriver-manager automatically ---
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        end_id = 469175
        try:
            driver.get(url)
            time.sleep(0.00001)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            first = soup.find("div", attrs={"class": "breaking__news"}).find("a")
            end_id = int(first["href"].split("/")[2])
        except:
            pass

        start_id = end_id - MAx_LIMIT_TODAY_DATA
        
        for story_id in range(start_id, end_id + 1):
            url = f"https://www.annapurnapost.com/story/{story_id}/"
            try:
                driver.get(url)
                time.sleep(0.00001)

                soup = BeautifulSoup(driver.page_source, 'html.parser')

                heading_tag = soup.find('h1', class_='news__title')
                heading = heading_tag.get_text(strip=True) if heading_tag else "No Heading Found"

                details_div = soup.find('div', class_='news__details')
                subheadings = [p.get_text(strip=True) for p in details_div.find_all('p')] if details_div else []
                subheading_text = "\n".join(subheadings) if subheadings else "No Subheadings Found"
                
                data = Data()
                data.source = url 
                data.title = heading
                data.description = subheading_text
                self.lists.append(data)

            except Exception as e:
                print(f"An error occurred for URL {url}: {e}")
        
        # Quit driver for Annapurna as well to save RAM
        driver.quit()

    def gettodaynews(self):
        return self.lists

class WebScrapper:
    lists: list[Data] = []
    def __init__(self) -> None:
        annapurnapost = Annapurna()
        kantipurpost = Kantipur()
        for data in kantipurpost.lists:
            for anna in annapurnapost.lists:
                if matchNews(anna.title, data.title) >= 0.5:
                    self.lists.append(data)
                    break
        for data in Kantipur.lists:
            for anna in annapurnapost.lists:
                if matchNews(anna.title, data.title) >= 0.5:
                    self.lists.append(data)
                    break