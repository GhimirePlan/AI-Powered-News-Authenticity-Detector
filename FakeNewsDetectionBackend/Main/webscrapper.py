import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager 
from bs4 import BeautifulSoup, Tag
from typing import List
import difflib

def matchNews(a, b):
    # Uses SequenceMatcher to determine similarity ratio between two titles
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
        print("\n[Kantipur] --- Starting Scraper ---")
        
        # Configure Headless Chrome for server environments
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox") # Required for running as root/server
        options.add_argument("--disable-dev-shm-usage") # Overcome limited resource problems
        
        print("[Kantipur] Initializing WebDriver...")
        service = Service(ChromeDriverManager().install())
        
        try:
            driver = webdriver.Chrome(service=service, options=options)
            print(f"[Kantipur] Opening URL: {url}")
            
            driver.get(url)
            time.sleep(3) 

            # Scroll logic to dynamically load content via AJAX
            last_height = driver.execute_script("return document.body.scrollHeight")
            extracted_data = 0
            max_data = MAx_LIMIT_TODAY_DATA
            
            print(f"[Kantipur] Starting scroll loop to fetch {max_data} articles...")
            
            while extracted_data < max_data:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)

                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    print("[Kantipur] Reached bottom of page.")
                    break
                last_height = new_height

                print("[Kantipur] Parsing page content...")
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                h2_tags = soup.find_all('h2')
                p_tags = soup.find_all('p')

                h2: Tag
                p: Tag 
                
                current_batch_count = 0
                for h2, p in zip(h2_tags, p_tags):
                    if extracted_data >= max_data:
                        break
                    heading = h2.get_text(strip=True)
                    try:
                        link = url + h2.find("a")['href']
                    except:
                        link = url
                    subheading = p.get_text(strip=True)
                    
                    if heading:
                        data = Data()
                        data.title = heading 
                        data.description = subheading
                        data.source = link 
                        self.lists.append(data)
                        extracted_data += 1
                        current_batch_count += 1
                
                print(f"[Kantipur] Extracted {current_batch_count} items. Total: {extracted_data}/{max_data}")

        except Exception as e:
            print(f"[Kantipur] Error: {e}")

        finally:
            try:
                print("[Kantipur] Closing Driver...")
                driver.quit()
            except NameError:
                pass
        
        print(f"[Kantipur] Finished. Total collected: {len(self.lists)}")

    def gettodaynews(self):
        return self.lists

class Annapurna:
    lists: List[Data] = []
    def __init__(self, url="https://www.annapurnapost.com/"):
        print("\n[Annapurna] --- Starting Scraper ---")
        
        # Configure Headless Chrome
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        print("[Annapurna] Initializing WebDriver...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        end_id = 469175
        try:
            print(f"[Annapurna] Determining latest story ID from {url}...")
            driver.get(url)
            time.sleep(2)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            first = soup.find("div", attrs={"class": "breaking__news"}).find("a")
            end_id = int(first["href"].split("/")[2])
            print(f"[Annapurna] Latest Story ID: {end_id}")
        except Exception as e:
            print(f"[Annapurna] Could not detect ID automatically (Error: {e}). Using default: {end_id}")

        start_id = end_id - MAx_LIMIT_TODAY_DATA
        print(f"[Annapurna] Target ID Range: {start_id} to {end_id}")
        
        count = 0
        for story_id in range(start_id, end_id + 1):
            target_url = f"https://www.annapurnapost.com/story/{story_id}/"
            try:
                driver.get(target_url)
                # Parse content
                soup = BeautifulSoup(driver.page_source, 'html.parser')

                heading_tag = soup.find('h1', class_='news__title')
                heading = heading_tag.get_text(strip=True) if heading_tag else "No Heading Found"

                if heading == "No Heading Found":
                    continue

                details_div = soup.find('div', class_='news__details')
                subheadings = [p.get_text(strip=True) for p in details_div.find_all('p')] if details_div else []
                subheading_text = "\n".join(subheadings) if subheadings else "No Subheadings Found"
                
                data = Data()
                data.source = target_url 
                data.title = heading
                data.description = subheading_text
                self.lists.append(data)
                count += 1
                
                if count % 5 == 0:
                    print(f"[Annapurna] Progress: {count} articles collected...")

            except Exception as e:
                print(f"[Annapurna] Error fetching {target_url}: {e}")
                # Handle session crashes gracefully to prevent loop lock
                if "invalid session id" in str(e).lower():
                    print("[Annapurna] Browser session crashed. Aborting loop.")
                    break
        
        print("[Annapurna] Closing Driver...")
        driver.quit()
        print(f"[Annapurna] Finished. Total collected: {len(self.lists)}")

    def gettodaynews(self):
        return self.lists

class WebScrapper:
    lists: list[Data] = []
    def __init__(self) -> None:
        print("\n[System] --- Initializing Aggregator ---")
        
        # Initialize individual scrapers
        annapurnapost = Annapurna()
        kantipurpost = Kantipur()
        
        print(f"[System] Starting Cross-Validation (Threshold: 0.5)...")
        print(f"[System] Kantipur Corpus: {len(kantipurpost.lists)} | Annapurna Corpus: {len(annapurnapost.lists)}")
        
        # Cross-reference articles to find common news stories
        # Pass 1: Kantipur -> Annapurna
        for data in kantipurpost.lists:
            for anna in annapurnapost.lists:
                if matchNews(anna.title, data.title) >= 0.5:
                    self.lists.append(data)
                    break
        
        # Pass 2: Annapurna -> Kantipur
        for data in kantipurpost.lists: 
            for anna in annapurnapost.lists:
                if matchNews(anna.title, data.title) >= 0.5:
                    self.lists.append(data)
                    break
                    
        print(f"[System] Aggregation Complete. Total Verified Articles: {len(self.lists)}")